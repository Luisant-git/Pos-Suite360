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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PurchasesService = class PurchasesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPurchaseDto, userId = 1) {
        return this.prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.create({
                data: {
                    invoiceNo: createPurchaseDto.invoiceNo,
                    date: new Date(createPurchaseDto.date),
                    supplierId: createPurchaseDto.supplierId,
                    paymentModeId: createPurchaseDto.paymentModeId,
                    subtotal: createPurchaseDto.subtotal,
                    tax: createPurchaseDto.tax || 0,
                    discount: createPurchaseDto.discount || 0,
                    grandTotal: createPurchaseDto.grandTotal,
                    items: {
                        create: createPurchaseDto.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            rate: item.rate,
                            tax: item.tax || 0,
                            amount: item.amount,
                        })),
                    },
                },
                include: { items: true },
            });
            for (const item of createPurchaseDto.items) {
                const currentProduct = await tx.product.findUnique({ where: { id: item.productId } });
                if (!currentProduct) {
                    throw new common_1.BadRequestException(`Product not found: ${item.productId}`);
                }
                let newPurchaseRate = Number(currentProduct.purchaseRate);
                let newWholesaleRate = Number(currentProduct.wholesaleRate);
                let newSellingRate = Number(currentProduct.sellingRate);
                let newMrp = Number(currentProduct.mrp);
                if (item.rate && item.rate > newPurchaseRate)
                    newPurchaseRate = item.rate;
                if (item.wRate && item.wRate > newWholesaleRate)
                    newWholesaleRate = item.wRate;
                if (item.sRate && item.sRate > newSellingRate)
                    newSellingRate = item.sRate;
                if (item.mrp && item.mrp > newMrp)
                    newMrp = item.mrp;
                const updatedProduct = await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        currentStock: { increment: item.quantity },
                        purchaseRate: newPurchaseRate,
                        wholesaleRate: newWholesaleRate,
                        sellingRate: newSellingRate,
                        mrp: newMrp,
                    },
                });
                await tx.stockTransaction.create({
                    data: {
                        date: new Date(createPurchaseDto.date),
                        productId: item.productId,
                        type: client_1.TransactionType.PURCHASE,
                        quantityIn: item.quantity,
                        quantityOut: 0,
                        balance: updatedProduct.currentStock,
                        reference: purchase.invoiceNo,
                    },
                });
            }
            return purchase;
        }).catch(err => {
            console.error('PRISMA ERROR IN PURCHASE CREATE:', err);
            throw new common_1.BadRequestException(err.message || 'Error creating purchase');
        });
    }
    findAll(query) {
        const where = {};
        if (query?.fromDate || query?.toDate) {
            where.date = {};
            if (query.fromDate)
                where.date.gte = new Date(query.fromDate);
            if (query.toDate) {
                const toDate = new Date(query.toDate);
                toDate.setHours(23, 59, 59, 999);
                where.date.lte = toDate;
            }
        }
        if (query?.supplierId) {
            where.supplierId = Number(query.supplierId);
        }
        if (query?.invoiceNo) {
            where.invoiceNo = { contains: query.invoiceNo, mode: 'insensitive' };
        }
        if (query?.paymentModeId) {
            where.paymentModeId = Number(query.paymentModeId);
        }
        return this.prisma.purchase.findMany({
            where,
            include: {
                supplier: true,
                paymentMode: true,
            },
            orderBy: [
                { date: 'desc' },
                { id: 'desc' }
            ],
        });
    }
    findOne(id) {
        return this.prisma.purchase.findUnique({
            where: { id },
            include: {
                supplier: true,
                paymentMode: true,
                items: {
                    include: {
                        product: {
                            include: {
                                unit: true
                            }
                        },
                    },
                },
            },
        });
    }
    async getLatestRate(productId) {
        const latestItem = await this.prisma.purchaseItem.findFirst({
            where: { productId },
            orderBy: { id: 'desc' },
        });
        return latestItem || null;
    }
    async getNextEntryNo() {
        const lastPurchase = await this.prisma.purchase.findFirst({
            orderBy: { id: 'desc' },
            select: { invoiceNo: true },
        });
        let nextNumber = 1;
        if (lastPurchase && lastPurchase.invoiceNo.startsWith('PUR-')) {
            const match = lastPurchase.invoiceNo.match(/PUR-(\d+)/);
            if (match && !isNaN(parseInt(match[1], 10))) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        return `PUR-${String(nextNumber).padStart(5, '0')}`;
    }
    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.findUnique({
                where: { id },
                include: { items: true }
            });
            if (!purchase) {
                throw new common_1.BadRequestException('Purchase not found');
            }
            for (const item of purchase.items) {
                const updatedProduct = await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        currentStock: { decrement: item.quantity },
                    },
                });
                await tx.stockTransaction.create({
                    data: {
                        date: new Date(),
                        productId: item.productId,
                        type: client_1.TransactionType.PURCHASE_RETURN,
                        quantityIn: 0,
                        quantityOut: item.quantity,
                        balance: updatedProduct.currentStock,
                        reference: `Reverted ${purchase.invoiceNo}`,
                    },
                });
            }
            await tx.purchaseItem.deleteMany({
                where: { purchaseId: id },
            });
            return tx.purchase.delete({
                where: { id },
            });
        });
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map