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
exports.PurchaseReturnsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PurchaseReturnsService = class PurchaseReturnsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPurchaseReturnDto) {
        return this.prisma.$transaction(async (tx) => {
            const purchaseReturn = await tx.purchaseReturn.create({
                data: {
                    returnNo: createPurchaseReturnDto.returnNo,
                    date: new Date(createPurchaseReturnDto.date),
                    purchaseId: createPurchaseReturnDto.purchaseId,
                    supplierId: createPurchaseReturnDto.supplierId,
                    remarks: createPurchaseReturnDto.remarks,
                    totalAmount: createPurchaseReturnDto.totalAmount,
                    items: {
                        create: createPurchaseReturnDto.items.map(item => ({
                            productId: item.productId,
                            returnQty: item.returnQty,
                            rate: item.rate,
                            amount: item.amount,
                        }))
                    }
                },
                include: { items: true }
            });
            for (const item of createPurchaseReturnDto.items) {
                if (item.returnQty > 0) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    if (!product)
                        throw new common_1.BadRequestException(`Product not found: ${item.productId}`);
                    if (product.currentStock < item.returnQty) {
                        throw new common_1.BadRequestException(`Insufficient stock for product ${product.name}`);
                    }
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { currentStock: { decrement: item.returnQty } }
                    });
                    await tx.stockTransaction.create({
                        data: {
                            date: new Date(createPurchaseReturnDto.date),
                            productId: item.productId,
                            type: 'PURCHASE_RETURN',
                            quantityOut: item.returnQty,
                            balance: product.currentStock - item.returnQty,
                            reference: createPurchaseReturnDto.returnNo
                        }
                    });
                }
            }
            return purchaseReturn;
        });
    }
    findAll() {
        return this.prisma.purchaseReturn.findMany({
            include: {
                supplier: true,
                purchase: true,
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    findOne(id) {
        return this.prisma.purchaseReturn.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                supplier: true,
                purchase: true
            }
        });
    }
    async getNextReturnNo() {
        const lastReturn = await this.prisma.purchaseReturn.findFirst({
            orderBy: { id: 'desc' },
            select: { returnNo: true },
        });
        let nextNumber = 1;
        if (lastReturn && lastReturn.returnNo.startsWith('PR-')) {
            const match = lastReturn.returnNo.match(/PR-(\d+)/);
            if (match && !isNaN(parseInt(match[1], 10))) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        return `PR-${String(nextNumber).padStart(5, '0')}`;
    }
};
exports.PurchaseReturnsService = PurchaseReturnsService;
exports.PurchaseReturnsService = PurchaseReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseReturnsService);
//# sourceMappingURL=purchase-returns.service.js.map