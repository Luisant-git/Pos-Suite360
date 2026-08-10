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
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardSummary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const salesAggregate = await this.prisma.sale.aggregate({
            _sum: { grandTotal: true },
            where: { date: { gte: today, lt: tomorrow } },
        });
        const salesToday = salesAggregate._sum.grandTotal ? Number(salesAggregate._sum.grandTotal) : 0;
        const purchasesAggregate = await this.prisma.purchase.aggregate({
            _sum: { grandTotal: true },
            where: { date: { gte: today, lt: tomorrow } },
        });
        const purchasesToday = purchasesAggregate._sum.grandTotal ? Number(purchasesAggregate._sum.grandTotal) : 0;
        const expensesAggregate = await this.prisma.expense.aggregate({
            _sum: { amount: true },
            where: { date: { gte: today, lt: tomorrow } },
        });
        const expensesToday = expensesAggregate._sum.amount ? Number(expensesAggregate._sum.amount) : 0;
        const productsCount = await this.prisma.product.count();
        const lowStockResult = await this.prisma.$queryRaw `
      SELECT COUNT(*) as count FROM "Product" WHERE "currentStock" <= "minStock"
    `;
        const lowStockCount = Number(lowStockResult[0]?.count || 0);
        const billsToday = await this.prisma.sale.count({
            where: { date: { gte: today, lt: tomorrow } },
        });
        const topProductsRaw = await this.prisma.$queryRaw `
      SELECT p."name", SUM(si."quantity") as salescount, SUM(si."amount") as amount
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      JOIN "Sale" s ON si."saleId" = s.id
      WHERE s."date" >= ${today} AND s."date" < ${tomorrow}
      GROUP BY p.id, p."name"
      ORDER BY amount DESC
      LIMIT 5
    `;
        const topProducts = topProductsRaw.map((p) => ({
            name: p.name,
            salesCount: Number(p.salescount),
            amount: Number(p.amount),
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
            salesToday,
            purchasesToday,
            expensesToday,
            productsCount,
            lowStockCount,
            billsToday,
            topProducts,
            chartData,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map