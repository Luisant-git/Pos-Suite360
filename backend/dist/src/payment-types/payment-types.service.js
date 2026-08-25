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
exports.PaymentTypesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentTypesService = class PaymentTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createPaymentTypeDto) {
        return this.prisma.paymentType.create({
            data: createPaymentTypeDto,
        });
    }
    findAll() {
        return this.prisma.paymentType.findMany({
            orderBy: { id: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.paymentType.findUnique({
            where: { id },
        });
    }
    update(id, updatePaymentTypeDto) {
        return this.prisma.paymentType.update({
            where: { id },
            data: updatePaymentTypeDto,
        });
    }
    async remove(id) {
        try {
            return await this.prisma.paymentType.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
                throw new common_1.BadRequestException('Cannot delete Payment Type because it is already used in transactions.');
            }
            throw error;
        }
    }
};
exports.PaymentTypesService = PaymentTypesService;
exports.PaymentTypesService = PaymentTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentTypesService);
//# sourceMappingURL=payment-types.service.js.map