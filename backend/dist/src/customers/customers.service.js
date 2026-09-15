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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createCustomerDto) {
        return this.prisma.customer.create({
            data: createCustomerDto,
        });
    }
    findAll() {
        return this.prisma.customer.findMany({
            orderBy: { id: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.customer.findUnique({
            where: { id },
        });
    }
    update(id, updateCustomerDto) {
        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
    }
    remove(id) {
        return this.prisma.customer.delete({
            where: { id },
        });
    }
    async getCustomerRates(customerId) {
        return this.prisma.customerProductRate.findMany({
            where: { customerId },
            include: { product: true },
            orderBy: { productId: 'asc' },
        });
    }
    async upsertCustomerRate(customerId, productId, rate) {
        return this.prisma.customerProductRate.upsert({
            where: {
                customerId_productId: { customerId, productId },
            },
            update: { rate },
            create: { customerId, productId, rate },
        });
    }
    async setCustomerRates(customerId, rates) {
        const results = [];
        for (const item of rates) {
            if (item.productId > 0) {
                const res = await this.upsertCustomerRate(customerId, item.productId, item.rate);
                results.push(res);
            }
        }
        return results;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map