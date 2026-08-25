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
exports.SalesReturnsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SalesReturnsService = class SalesReturnsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSalesReturnDto) {
        return this.prisma.$transaction(async (tx) => {
            const salesReturn = await tx.salesReturn.create({
                data: {
                    returnNo: createSalesReturnDto.returnNo,
                    date: new Date(createSalesReturnDto.date),
                    saleId: createSalesReturnDto.saleId,
                    customerId: createSalesReturnDto.customerId,
                    userId: 1,
                    remarks: createSalesReturnDto.remarks,
                    totalAmount: createSalesReturnDto.totalAmount,
                    items: {
                        create: createSalesReturnDto.items.map(item => ({
                            productId: item.productId,
                            returnQty: item.returnQty,
                            rate: item.rate,
                            amount: item.amount,
                        }))
                    }
                },
                include: { items: true }
            });
            for (const item of createSalesReturnDto.items) {
                if (item.returnQty > 0) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    if (!product)
                        throw new common_1.BadRequestException(`Product not found: ${item.productId}`);
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { currentStock: { increment: item.returnQty } }
                    });
                    await tx.stockTransaction.create({
                        data: {
                            date: new Date(createSalesReturnDto.date),
                            productId: item.productId,
                            type: 'SALE_RETURN',
                            quantityIn: item.returnQty,
                            balance: product.currentStock + item.returnQty,
                            reference: createSalesReturnDto.returnNo
                        }
                    });
                }
            }
            return salesReturn;
        });
    }
    findAll() {
        return this.prisma.salesReturn.findMany({
            include: {
                customer: true,
                sale: true,
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    findOne(id) {
        return this.prisma.salesReturn.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                customer: true,
                sale: true
            }
        });
    }
    async getNextReturnNo() {
        const lastReturn = await this.prisma.salesReturn.findFirst({
            orderBy: { id: 'desc' },
            select: { returnNo: true },
        });
        let nextNumber = 1;
        if (lastReturn && lastReturn.returnNo.startsWith('SR-')) {
            const match = lastReturn.returnNo.match(/SR-(\d+)/);
            if (match && !isNaN(parseInt(match[1], 10))) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        return `SR-${String(nextNumber).padStart(5, '0')}`;
    }
};
exports.SalesReturnsService = SalesReturnsService;
exports.SalesReturnsService = SalesReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesReturnsService);
//# sourceMappingURL=sales-returns.service.js.map