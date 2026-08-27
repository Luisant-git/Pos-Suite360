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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SalesService = class SalesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSaleDto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const settings = await tx.settings.findUnique({ where: { id: 1 } });
            let prefix = settings?.invoicePrefix || 'INV-';
            if (settings?.yearlyInvoiceReset) {
                const cleanPrefix = prefix.endsWith('-') ? prefix.slice(0, -1) : prefix;
                prefix = `${cleanPrefix}-${new Date().getFullYear()}-`;
            }
            const lastSale = await tx.sale.findFirst({
                orderBy: { invoiceNo: 'desc' },
                select: { invoiceNo: true },
            });
            let nextNumber = 1;
            if (lastSale && lastSale.invoiceNo.startsWith(prefix)) {
                const remainingStr = lastSale.invoiceNo.substring(prefix.length);
                const match = remainingStr.match(/^(\d+)/);
                if (match && !isNaN(parseInt(match[1], 10))) {
                    nextNumber = parseInt(match[1], 10) + 1;
                }
            }
            const finalInvoiceNo = `${prefix}${String(nextNumber).padStart(5, '0')}`;
            const sale = await tx.sale.create({
                data: {
                    invoiceNo: finalInvoiceNo,
                    date: new Date(createSaleDto.date),
                    customerId: createSaleDto.customerId,
                    userId: userId,
                    paymentModeId: createSaleDto.paymentModeId,
                    subtotal: createSaleDto.subtotal,
                    tax: createSaleDto.tax || 0,
                    discount: createSaleDto.discount || 0,
                    grandTotal: createSaleDto.grandTotal,
                    items: {
                        create: createSaleDto.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            noOfBirds: item.noOfBirds || 0,
                            rate: item.rate,
                            discount: item.discount || 0,
                            tax: item.tax || 0,
                            amount: item.amount,
                        })),
                    },
                },
                include: { items: true },
            });
            for (const item of createSaleDto.items) {
                const updatedProduct = await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        currentStock: { decrement: item.quantity },
                    },
                });
                await tx.stockTransaction.create({
                    data: {
                        date: new Date(createSaleDto.date),
                        productId: item.productId,
                        type: client_1.TransactionType.SALE,
                        quantityIn: 0,
                        quantityOut: item.quantity,
                        balance: updatedProduct.currentStock,
                        reference: sale.invoiceNo,
                    },
                });
            }
            return sale;
        }).catch(err => {
            console.error('PRISMA ERROR IN SALE CREATE:', err);
            throw new common_1.BadRequestException(err.message || 'Error creating sale');
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
        if (query?.customerId) {
            where.customerId = Number(query.customerId);
        }
        if (query?.invoiceNo) {
            where.invoiceNo = { contains: query.invoiceNo, mode: 'insensitive' };
        }
        if (query?.paymentModeId) {
            where.paymentModeId = Number(query.paymentModeId);
        }
        return this.prisma.sale.findMany({
            where,
            include: {
                customer: true,
                paymentMode: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: [
                { date: 'desc' },
                { id: 'desc' }
            ],
        });
    }
    findOne(id) {
        return this.prisma.sale.findUnique({
            where: { id },
            include: {
                customer: true,
                paymentMode: true,
                user: {
                    select: { id: true, name: true, username: true }
                },
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
    async getNextInvoiceNo() {
        const settings = await this.prisma.settings.findUnique({ where: { id: 1 } });
        let prefix = settings?.invoicePrefix || 'INV-';
        if (settings?.yearlyInvoiceReset) {
            const cleanPrefix = prefix.endsWith('-') ? prefix.slice(0, -1) : prefix;
            prefix = `${cleanPrefix}-${new Date().getFullYear()}-`;
        }
        const lastSale = await this.prisma.sale.findFirst({
            orderBy: { invoiceNo: 'desc' },
            select: { invoiceNo: true },
        });
        let nextNumber = 1;
        if (lastSale && lastSale.invoiceNo.startsWith(prefix)) {
            const remainingStr = lastSale.invoiceNo.substring(prefix.length);
            const match = remainingStr.match(/^(\d+)/);
            if (match && !isNaN(parseInt(match[1], 10))) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        return `${prefix}${String(nextNumber).padStart(5, '0')}`;
    }
    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id },
                include: { items: true }
            });
            if (!sale) {
                throw new common_1.BadRequestException('Sale not found');
            }
            for (const item of sale.items) {
                const updatedProduct = await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        currentStock: { increment: item.quantity },
                    },
                });
                await tx.stockTransaction.create({
                    data: {
                        date: new Date(),
                        productId: item.productId,
                        type: client_1.TransactionType.SALE_RETURN,
                        quantityIn: item.quantity,
                        quantityOut: 0,
                        balance: updatedProduct.currentStock,
                        reference: `Reverted ${sale.invoiceNo}`,
                    },
                });
            }
            await tx.saleItem.deleteMany({
                where: { saleId: id },
            });
            return tx.sale.delete({
                where: { id },
            });
        });
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map