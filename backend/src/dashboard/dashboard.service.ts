import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's Sales
    const salesAggregate = await this.prisma.sale.aggregate({
      _sum: { grandTotal: true },
      where: { date: { gte: today, lt: tomorrow } },
    });
    const salesToday = salesAggregate._sum.grandTotal ? Number(salesAggregate._sum.grandTotal) : 0;

    // Today's Purchases
    const purchasesAggregate = await this.prisma.purchase.aggregate({
      _sum: { grandTotal: true },
      where: { date: { gte: today, lt: tomorrow } },
    });
    const purchasesToday = purchasesAggregate._sum.grandTotal ? Number(purchasesAggregate._sum.grandTotal) : 0;

    // Today's Expenses
    const expensesAggregate = await this.prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: today, lt: tomorrow } },
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
      where: { date: { gte: today, lt: tomorrow } },
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
      salesToday,
      purchasesToday,
      expensesToday,
      productsCount,
      lowStockCount,
      billsToday,
      lowStockProducts,
      chartData,
    };
  }
}
