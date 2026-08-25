"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const customer_receipts_service_1 = require("../customer-receipts/customer-receipts.service");
const supplier_payments_service_1 = require("../supplier-payments/supplier-payments.service");
let DashboardService = class DashboardService {
    prisma;
    customerReceiptsService;
    supplierPaymentsService;
    constructor(prisma, customerReceiptsService, supplierPaymentsService) {
        this.prisma = prisma;
        this.customerReceiptsService = customerReceiptsService;
        this.supplierPaymentsService = supplierPaymentsService;
    }
    async getDashboardSummary(startDateStr, endDateStr) {
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
        end.setDate(end.getDate() + 1);
        const firstDayOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
        const cashSalesAggregate = await this.prisma.sale.aggregate({
            _sum: { grandTotal: true },
            where: {
                date: { gte: start, lt: end },
                paymentMode: { name: { not: 'Credit' } }
            },
        });
        const cashSalesToday = cashSalesAggregate._sum.grandTotal ? Number(cashSalesAggregate._sum.grandTotal) : 0;
        const creditSalesAggregate = await this.prisma.sale.aggregate({
            _sum: { grandTotal: true },
            where: {
                date: { gte: start, lt: end },
                paymentMode: { name: 'Credit' }
            },
        });
        const creditSalesToday = creditSalesAggregate._sum.grandTotal ? Number(creditSalesAggregate._sum.grandTotal) : 0;
        const cashPurchasesAggregate = await this.prisma.purchase.aggregate({
            _sum: { grandTotal: true },
            where: {
                date: { gte: start, lt: end },
                paymentMode: { name: { not: 'Credit' } }
            },
        });
        const cashPurchasesToday = cashPurchasesAggregate._sum.grandTotal ? Number(cashPurchasesAggregate._sum.grandTotal) : 0;
        const creditPurchasesAggregate = await this.prisma.purchase.aggregate({
            _sum: { grandTotal: true },
            where: {
                date: { gte: start, lt: end },
                paymentMode: { name: 'Credit' }
            },
        });
        const creditPurchasesToday = creditPurchasesAggregate._sum.grandTotal ? Number(creditPurchasesAggregate._sum.grandTotal) : 0;
        const allPurchases = await this.prisma.purchase.aggregate({ _sum: { grandTotal: true } });
        const allPayments = await this.prisma.supplierPayment.aggregate({ _sum: { amount: true } });
        const allPurchaseReturns = await this.prisma.purchaseReturn.aggregate({ _sum: { totalAmount: true } });
        const supplierOpenings = await this.prisma.$queryRaw `
      SELECT 
        SUM(CASE WHEN "openingBalanceType" = 'Cr' THEN "openingBalance" ELSE 0 END) as cr_total,
        SUM(CASE WHEN "openingBalanceType" = 'Dr' THEN "openingBalance" ELSE 0 END) as dr_total
      FROM "Supplier"
    `;
        const supplierCr = Number(supplierOpenings[0]?.cr_total || 0);
        const supplierDr = Number(supplierOpenings[0]?.dr_total || 0);
        const pendingPayables = (Number(allPurchases._sum.grandTotal) || 0) +
            (supplierCr - supplierDr) -
            (Number(allPayments._sum.amount) || 0) -
            (Number(allPurchaseReturns._sum.totalAmount) || 0);
        const allSales = await this.prisma.sale.aggregate({ _sum: { grandTotal: true } });
        const allReceipts = await this.prisma.customerReceipt.aggregate({ _sum: { amount: true } });
        const allSalesReturns = await this.prisma.salesReturn.aggregate({ _sum: { totalAmount: true } });
        const customerOpenings = await this.prisma.$queryRaw `
      SELECT 
        SUM(CASE WHEN "openingBalanceType" = 'Dr' THEN "openingBalance" ELSE 0 END) as dr_total,
        SUM(CASE WHEN "openingBalanceType" = 'Cr' THEN "openingBalance" ELSE 0 END) as cr_total
      FROM "Customer"
    `;
        const customerDr = Number(customerOpenings[0]?.dr_total || 0);
        const customerCr = Number(customerOpenings[0]?.cr_total || 0);
        const pendingReceivables = (Number(allSales._sum.grandTotal) || 0) +
            (customerDr - customerCr) -
            (Number(allReceipts._sum.amount) || 0) -
            (Number(allSalesReturns._sum.totalAmount) || 0);
        const expensesAggregate = await this.prisma.expense.aggregate({
            _sum: { amount: true },
            where: { date: { gte: start, lt: end } },
        });
        const expensesToday = expensesAggregate._sum.amount ? Number(expensesAggregate._sum.amount) : 0;
        const productsCount = await this.prisma.product.count();
        const lowStockResult = await this.prisma.$queryRaw `
      SELECT COUNT(*) as count FROM "Product" WHERE "currentStock" <= "minStock"
    `;
        const lowStockCount = Number(lowStockResult[0]?.count || 0);
        const billsToday = await this.prisma.sale.count({
            where: { date: { gte: start, lt: end } },
        });
        const lowStockProductsRaw = await this.prisma.$queryRaw `
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
        const chartDataRaw = await this.prisma.$queryRaw `
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
            unpaidCustomerBills: await this.getTopUnpaidCustomerBills(15),
            unpaidSupplierBills: await this.getTopUnpaidSupplierBills(15)
        };
    }
    async getTopUnpaidCustomerBills(limit) {
        const customers = await this.prisma.customer.findMany();
        let allUnpaidBills = [];
        for (const customer of customers) {
            try {
                const { balance } = await this.customerReceiptsService.getBalance(customer.id);
                if (balance > 0) {
                    const unpaid = await this.customerReceiptsService.getUnpaidBills(customer.id);
                    const pendingBills = unpaid.filter(b => b.pending > 0).map(b => ({
                        ...b,
                        entityName: customer.name,
                        entityId: customer.id
                    }));
                    allUnpaidBills.push(...pendingBills);
                }
            }
            catch (e) {
            }
        }
        allUnpaidBills.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return allUnpaidBills.slice(0, limit);
    }
    async getTopUnpaidSupplierBills(limit) {
        const suppliers = await this.prisma.supplier.findMany();
        let allUnpaidBills = [];
        for (const supplier of suppliers) {
            try {
                const { balance } = await this.supplierPaymentsService.getBalance(supplier.id);
                if (balance > 0) {
                    const unpaid = await this.supplierPaymentsService.getUnpaidBills(supplier.id);
                    const pendingBills = unpaid.filter(b => b.pending > 0).map(b => ({
                        ...b,
                        entityName: supplier.name,
                        entityId: supplier.id
                    }));
                    allUnpaidBills.push(...pendingBills);
                }
            }
            catch (e) {
            }
        }
        allUnpaidBills.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return allUnpaidBills.slice(0, limit);
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_receipts_service_1.CustomerReceiptsService,
        supplier_payments_service_1.SupplierPaymentsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map