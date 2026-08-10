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
            const sale = await tx.sale.create({
                data: {
                    invoiceNo: createSaleDto.invoiceNo,
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
        });
    }
    findAll() {
        return this.prisma.sale.findMany({
            include: {
                customer: true,
                paymentMode: true,
            },
            orderBy: { date: 'desc' },
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
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map