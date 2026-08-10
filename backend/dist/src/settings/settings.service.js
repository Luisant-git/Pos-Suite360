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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        let settings = await this.prisma.settings.findUnique({
            where: { id: 1 },
        });
        if (!settings) {
            settings = await this.prisma.settings.create({
                data: {
                    id: 1,
                    shopName: 'My Shop',
                    currencySymbol: 'RM',
                    currencyPosition: 'before',
                    invoicePrefix: 'INV-',
                },
            });
        }
        return settings;
    }
    async updateSettings(data) {
        return this.prisma.settings.upsert({
            where: { id: 1 },
            update: {
                shopName: data.shopName,
                shopAddress: data.shopAddress,
                phone: data.phone,
                email: data.email,
                currencySymbol: data.currencySymbol,
                currencyPosition: data.currencyPosition,
                invoicePrefix: data.invoicePrefix,
            },
            create: {
                id: 1,
                shopName: data.shopName || 'My Shop',
                shopAddress: data.shopAddress,
                phone: data.phone,
                email: data.email,
                currencySymbol: data.currencySymbol || 'RM',
                currencyPosition: data.currencyPosition || 'before',
                invoicePrefix: data.invoicePrefix || 'INV-',
            },
        });
    }
    async resetDatabase() {
        try {
            await this.prisma.saleItem.deleteMany();
            await this.prisma.sale.deleteMany();
            await this.prisma.purchaseItem.deleteMany();
            await this.prisma.purchase.deleteMany();
            await this.prisma.stockTransaction.deleteMany();
            await this.prisma.expense.deleteMany();
            await this.prisma.supplierPayment.deleteMany();
            await this.prisma.customerReceipt.deleteMany();
            await this.prisma.product.deleteMany();
            await this.prisma.supplier.deleteMany();
            await this.prisma.customer.deleteMany();
            await this.prisma.category.deleteMany();
            await this.prisma.brand.deleteMany();
            await this.prisma.unit.deleteMany();
            await this.prisma.expenseCategory.deleteMany();
            return { message: 'Database reset successfully' };
        }
        catch (error) {
            console.error('Reset DB Error:', error);
            throw new common_1.BadRequestException('Failed to reset database: ' + (error.message || ''));
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map