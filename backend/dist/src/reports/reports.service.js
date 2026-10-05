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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfitLoss(fromDateStr, toDateStr) {
        const whereDate = {};
        if (fromDateStr || toDateStr) {
            whereDate.date = {};
            if (fromDateStr) {
                whereDate.date.gte = new Date(`${fromDateStr}T00:00:00+08:00`);
            }
            if (toDateStr) {
                whereDate.date.lte = new Date(`${toDateStr}T23:59:59.999+08:00`);
            }
        }
        const sales = await this.prisma.sale.aggregate({
            where: whereDate,
            _sum: { grandTotal: true },
        });
        const grossSales = Number(sales._sum.grandTotal || 0);
        const salesReturns = await this.prisma.salesReturn.aggregate({
            where: whereDate,
            _sum: { totalAmount: true },
        });
        const totalSalesReturns = Number(salesReturns._sum.totalAmount || 0);
        const netOperatingRevenue = grossSales - totalSalesReturns;
        const purchases = await this.prisma.purchase.aggregate({
            where: whereDate,
            _sum: { grandTotal: true },
        });
        const grossPurchases = Number(purchases._sum.grandTotal || 0);
        const purchaseReturns = await this.prisma.purchaseReturn.aggregate({
            where: whereDate,
            _sum: { totalAmount: true },
        });
        const totalPurchaseReturns = Number(purchaseReturns._sum.totalAmount || 0);
        const netCogs = grossPurchases - totalPurchaseReturns;
        const openingStockValue = 0;
        const closingStockValue = 0;
        const grossProfit = netOperatingRevenue - netCogs;
        const expenses = await this.prisma.expense.findMany({
            where: whereDate,
            include: { category: true },
        });
        const expensesByCategory = {};
        let totalExpenses = 0;
        for (const exp of expenses) {
            const amount = Number(exp.amount || 0);
            totalExpenses += amount;
            const catName = exp.category?.name || 'Uncategorized';
            if (!expensesByCategory[catName]) {
                expensesByCategory[catName] = 0;
            }
            expensesByCategory[catName] += amount;
        }
        const itemizedExpenses = Object.keys(expensesByCategory).map(name => ({
            name,
            amount: expensesByCategory[name],
        }));
        const netProfit = grossProfit - totalExpenses;
        return {
            grossSales,
            totalSalesReturns,
            netOperatingRevenue,
            openingStockValue,
            grossPurchases,
            totalPurchaseReturns,
            closingStockValue,
            netCogs,
            grossProfit,
            itemizedExpenses,
            totalExpenses,
            netProfit,
        };
    }
    async getProductWiseSales(fromDate, toDate, productId) {
        const whereDate = {};
        if (fromDate || toDate) {
            whereDate.date = {};
            if (fromDate) {
                whereDate.date.gte = new Date(`${fromDate}T00:00:00+08:00`);
            }
            if (toDate) {
                whereDate.date.lte = new Date(`${toDate}T23:59:59.999+08:00`);
            }
        }
        const saleItems = await this.prisma.saleItem.findMany({
            where: {
                sale: whereDate,
                ...(productId ? { productId } : {}),
            },
            include: {
                sale: true,
                product: true
            }
        });
        const productGroups = {};
        for (const item of saleItems) {
            if (!item.product)
                continue;
            const productKey = `${item.product.code ? item.product.code + ' - ' : ''}${item.product.name}`;
            if (!productGroups[productKey]) {
                productGroups[productKey] = {
                    productName: productKey,
                    items: [],
                    totalQty: 0,
                    totalValue: 0
                };
            }
            const qty = Number(item.quantity) || 0;
            const value = Number(item.amount) || 0;
            productGroups[productKey].items.push({
                invoiceNo: item.sale?.invoiceNo || '-',
                date: item.sale?.date || new Date(),
                qty: qty,
                value: value,
                saleId: item.saleId
            });
            productGroups[productKey].totalQty += qty;
            productGroups[productKey].totalValue += value;
        }
        return Object.values(productGroups).sort((a, b) => a.productName.localeCompare(b.productName));
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map