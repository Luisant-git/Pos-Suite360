import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary(startDateStr?: string, endDateStr?: string) {
    const start = startDateStr ? new Date(startDateStr) : new Date();
    if (isNaN(start.getTime())) {
      start.setTime(Date.now());
    }
    start.setHours(0, 0, 0, 0);

    const end = endDateStr ? new Date(endDateStr) : new Date(start);
    if (isNaN(end.getTime())) {
      end.setTime(start.getTime());
    }
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1); // Exclusive upper bound for the end date

    const firstDayOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);

    // Cash Sales
    const cashSalesAggregate = await this.prisma.sale.aggregate({
      _sum: { grandTotal: true },
      where: { 
        date: { gte: start, lt: end },
        paymentMode: { name: { not: 'Credit' } }
      },
    });
    const cashSalesToday = cashSalesAggregate._sum.grandTotal ? Number(cashSalesAggregate._sum.grandTotal) : 0;

    // Credit Sales
    const creditSalesAggregate = await this.prisma.sale.aggregate({
      _sum: { grandTotal: true },
      where: { 
        date: { gte: start, lt: end },
        paymentMode: { name: 'Credit' }
      },
    });
    const creditSalesToday = creditSalesAggregate._sum.grandTotal ? Number(creditSalesAggregate._sum.grandTotal) : 0;

    // Cash Purchases
    const cashPurchasesAggregate = await this.prisma.purchase.aggregate({
      _sum: { grandTotal: true },
      where: { 
        date: { gte: start, lt: end },
        paymentMode: { name: { not: 'Credit' } }
      },
    });
    const cashPurchasesToday = cashPurchasesAggregate._sum.grandTotal ? Number(cashPurchasesAggregate._sum.grandTotal) : 0;

    // Credit Purchases
    const creditPurchasesAggregate = await this.prisma.purchase.aggregate({
      _sum: { grandTotal: true },
      where: { 
        date: { gte: start, lt: end },
        paymentMode: { name: 'Credit' }
      },
    });
    const creditPurchasesToday = creditPurchasesAggregate._sum.grandTotal ? Number(creditPurchasesAggregate._sum.grandTotal) : 0;

    // --- PENDING BALANCES (Across all time) ---
    // Supplier Payables (What we owe) = Purchases + Opening(Cr - Dr) - Payments - PurchaseReturns
    const allPurchases = await this.prisma.purchase.aggregate({ _sum: { grandTotal: true } });
    const allPayments = await this.prisma.supplierPayment.aggregate({ _sum: { amount: true } });
    const allPurchaseReturns = await this.prisma.purchaseReturn.aggregate({ _sum: { totalAmount: true } });
    const supplierOpenings = await this.prisma.$queryRaw`
      SELECT 
        SUM(CASE WHEN "openingBalanceType" = 'Cr' THEN "openingBalance" ELSE 0 END) as cr_total,
        SUM(CASE WHEN "openingBalanceType" = 'Dr' THEN "openingBalance" ELSE 0 END) as dr_total
      FROM "Supplier"
    ` as any[];
    
    const supplierCr = Number(supplierOpenings[0]?.cr_total || 0);
    const supplierDr = Number(supplierOpenings[0]?.dr_total || 0);
    const pendingPayables = 
      (Number(allPurchases._sum.grandTotal) || 0) + 
      (supplierCr - supplierDr) - 
      (Number(allPayments._sum.amount) || 0) - 
      (Number(allPurchaseReturns._sum.totalAmount) || 0);

    // Customer Receivables (What customers owe us) = Sales + Opening(Dr - Cr) - Receipts - SalesReturns
    const allSales = await this.prisma.sale.aggregate({ _sum: { grandTotal: true } });
    const allReceipts = await this.prisma.customerReceipt.aggregate({ _sum: { amount: true } });
    const allSalesReturns = await this.prisma.salesReturn.aggregate({ _sum: { totalAmount: true } });
    const customerOpenings = await this.prisma.$queryRaw`
      SELECT 
        SUM(CASE WHEN "openingBalanceType" = 'Dr' THEN "openingBalance" ELSE 0 END) as dr_total,
        SUM(CASE WHEN "openingBalanceType" = 'Cr' THEN "openingBalance" ELSE 0 END) as cr_total
      FROM "Customer"
    ` as any[];
    
    const customerDr = Number(customerOpenings[0]?.dr_total || 0);
    const customerCr = Number(customerOpenings[0]?.cr_total || 0);
    const pendingReceivables = 
      (Number(allSales._sum.grandTotal) || 0) + 
      (customerDr - customerCr) - 
      (Number(allReceipts._sum.amount) || 0) - 
      (Number(allSalesReturns._sum.totalAmount) || 0);

    // Today's Expenses
    const expensesAggregate = await this.prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: start, lt: end } },
    });
    const expensesToday = expensesAggregate._sum.amount ? Number(expensesAggregate._sum.amount) : 0;

    // Products Count
    const productsCount = await this.prisma.product.count();

    // Low Stock Count
    const lowStockResult: any[] = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Product" WHERE "currentStock" <= "minStock"
    `;
    const lowStockCount = Number(lowStockResult[0]?.count || 0);

    // Today's Bills
    const billsToday = await this.prisma.sale.count({
      where: { date: { gte: start, lt: end } },
    });

    // Low Stock Products Details
    const lowStockProductsRaw: any[] = await this.prisma.$queryRaw`
      SELECT id, name, "currentStock", "minStock" 
      FROM "Product" 
      WHERE "currentStock" <= "minStock" 
      ORDER BY "currentStock" ASC 
      LIMIT 10
    `;
    const lowStockProducts = lowStockProductsRaw.map((p) => ({
      id: Number(p.id),
      name: p.name,
      currentStock: Number(p.currentStock),
      minStock: Number(p.minStock),
    }));

    // Monthly Chart Data (group by date)
    const chartDataRaw: any[] = await this.prisma.$queryRaw`
      SELECT DATE(s."date") as "name", SUM(s."grandTotal") as "sales"
      FROM "Sale" s
      WHERE s."date" >= ${firstDayOfMonth}
      GROUP BY DATE(s."date")
      ORDER BY DATE(s."date") ASC
    `;
    const chartData = chartDataRaw.map((d) => {
      const dateObj = new Date(d.name);
      return {
        name: dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        sales: Number(d.sales),
      };
    });

    return {
      cashSalesToday,
      creditSalesToday,
      cashPurchasesToday,
      creditPurchasesToday,
      pendingPayables,
      pendingReceivables,
      expensesToday,
      productsCount,
      lowStockCount,
      billsToday,
      lowStockProducts,
      chartData,
    };
  }
}
