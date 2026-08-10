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
exports.SupplierPaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SupplierPaymentsService = class SupplierPaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, userId) {
        if (!data.paymentNo || !data.supplierId || !data.amount || !data.paymentModeId) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        try {
            return await this.prisma.supplierPayment.create({
                data: {
                    paymentNo: data.paymentNo,
                    date: new Date(data.date || new Date()),
                    supplierId: Number(data.supplierId),
                    amount: Number(data.amount),
                    paymentModeId: Number(data.paymentModeId),
                    reference: data.reference,
                    remarks: data.remarks,
                    userId: userId,
                },
                include: {
                    supplier: true,
                    paymentMode: true,
                },
            });
        }
        catch (error) {
            console.error('Error creating supplier payment:', error);
            throw new common_1.BadRequestException('Failed to record payment. ' + (error.message || ''));
        }
    }
    async findAll() {
        return this.prisma.supplierPayment.findMany({
            orderBy: { date: 'desc' },
            include: {
                supplier: true,
                paymentMode: true,
            },
        });
    }
    async getBalance(supplierId) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: supplierId },
        });
        if (!supplier) {
            throw new common_1.BadRequestException('Supplier not found');
        }
        const purchases = await this.prisma.purchase.aggregate({
            where: { supplierId },
            _sum: { grandTotal: true },
        });
        const payments = await this.prisma.supplierPayment.aggregate({
            where: { supplierId },
            _sum: { amount: true },
        });
        const openingBalance = Number(supplier.openingBalance) || 0;
        const isOpeningCredit = supplier.openingBalanceType === 'Cr';
        const isOpeningDebit = supplier.openingBalanceType === 'Dr';
        let totalOwed = 0;
        if (isOpeningCredit)
            totalOwed += openingBalance;
        if (isOpeningDebit)
            totalOwed -= openingBalance;
        const totalPurchases = Number(purchases._sum.grandTotal) || 0;
        const totalPaid = Number(payments._sum.amount) || 0;
        const balance = totalOwed + totalPurchases - totalPaid;
        return { balance };
    }
    async generatePaymentNo() {
        const lastPayment = await this.prisma.supplierPayment.findFirst({
            orderBy: { id: 'desc' },
        });
        let nextNo = 1;
        if (lastPayment && lastPayment.paymentNo.startsWith('PAY-')) {
            const parts = lastPayment.paymentNo.split('-');
            if (parts.length === 2) {
                nextNo = parseInt(parts[1], 10) + 1;
            }
        }
        return `PAY-${nextNo.toString().padStart(6, '0')}`;
    }
    async getUnpaidBills(supplierId) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: supplierId },
        });
        if (!supplier) {
            throw new common_1.BadRequestException('Supplier not found');
        }
        const payments = await this.prisma.supplierPayment.aggregate({
            where: { supplierId },
            _sum: { amount: true },
        });
        let totalPaid = Number(payments._sum.amount) || 0;
        const openingBalance = Number(supplier.openingBalance) || 0;
        const isOpeningCredit = supplier.openingBalanceType === 'Cr';
        const isOpeningDebit = supplier.openingBalanceType === 'Dr';
        let bills = [];
        if (isOpeningCredit && openingBalance > 0) {
            bills.push({
                entryNo: 'Opening Balance',
                date: supplier.createdAt,
                total: openingBalance,
                received: 0,
                pending: openingBalance
            });
        }
        else if (isOpeningDebit && openingBalance > 0) {
            totalPaid += openingBalance;
        }
        const purchases = await this.prisma.purchase.findMany({
            where: { supplierId },
            orderBy: { date: 'asc' },
        });
        for (const purchase of purchases) {
            bills.push({
                entryNo: purchase.invoiceNo,
                date: purchase.date,
                total: Number(purchase.grandTotal) || 0,
                received: 0,
                pending: Number(purchase.grandTotal) || 0
            });
        }
        const unpaidBills = [];
        for (const bill of bills) {
            if (totalPaid >= bill.total) {
                bill.received = bill.total;
                bill.pending = 0;
                totalPaid -= bill.total;
            }
            else if (totalPaid > 0 && totalPaid < bill.total) {
                bill.received = totalPaid;
                bill.pending = bill.total - totalPaid;
                totalPaid = 0;
                unpaidBills.push(bill);
            }
            else {
                bill.received = 0;
                bill.pending = bill.total;
                unpaidBills.push(bill);
            }
        }
        return unpaidBills;
    }
};
exports.SupplierPaymentsService = SupplierPaymentsService;
exports.SupplierPaymentsService = SupplierPaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupplierPaymentsService);
//# sourceMappingURL=supplier-payments.service.js.map