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
exports.PaymentModesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentModesService = class PaymentModesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createPaymentModeDto) {
        return this.prisma.paymentMode.create({
            data: createPaymentModeDto,
        });
    }
    findAll() {
        return this.prisma.paymentMode.findMany({
            orderBy: { id: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.paymentMode.findUnique({
            where: { id },
        });
    }
    update(id, updatePaymentModeDto) {
        return this.prisma.paymentMode.update({
            where: { id },
            data: updatePaymentModeDto,
        });
    }
    async remove(id) {
        try {
            return await this.prisma.paymentMode.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
                throw new common_1.BadRequestException('Cannot delete Payment Mode because it is already used in transactions (e.g. Sales, Purchases, Receipts).');
            }
            throw error;
        }
    }
};
exports.PaymentModesService = PaymentModesService;
exports.PaymentModesService = PaymentModesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentModesService);
//# sourceMappingURL=payment-modes.service.js.map