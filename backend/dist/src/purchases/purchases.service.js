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
    async create(createPurchaseDto) {
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
                const updatedProduct = await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        currentStock: { increment: item.quantity },
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
        });
    }
    findAll() {
        return this.prisma.purchase.findMany({
            include: {
                supplier: true,
                paymentMode: true,
            },
            orderBy: { date: 'desc' },
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
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map