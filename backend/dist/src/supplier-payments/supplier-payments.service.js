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
        if (!data.paymentNo || !data.supplierId || !data.amount || !data.paymentTypeId) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        try {
            return await this.prisma.supplierPayment.create({
                data: {
                    paymentNo: data.paymentNo,
                    date: new Date(data.date || new Date()),
                    supplierId: Number(data.supplierId),
                    amount: Number(data.amount),
                    paymentTypeId: Number(data.paymentTypeId),
                    reference: data.reference,
                    remarks: data.remarks,
                    userId: userId,
                },
                include: {
                    supplier: true,
                    paymentType: true,
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
            orderBy: [
                { date: 'desc' },
                { id: 'desc' }
            ],
            include: {
                supplier: true,
                paymentType: true,
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
            where: {
                supplierId,
                paymentModeId: 4
            },
            _sum: { grandTotal: true },
        });
        const payments = await this.prisma.supplierPayment.aggregate({
            where: { supplierId },
            _sum: { amount: true },
        });
        const purchaseReturns = await this.prisma.purchaseReturn.aggregate({
            where: { supplierId },
            _sum: { totalAmount: true },
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
        const totalReturns = Number(purchaseReturns._sum.totalAmount) || 0;
        const balance = totalOwed + totalPurchases - totalPaid - totalReturns;
        return { balance, totalReturns };
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
        const purchaseReturns = await this.prisma.purchaseReturn.findMany({
            where: { supplierId },
        });
        const mappedReturns = {};
        let unmappedReturns = 0;
        purchaseReturns.forEach(pr => {
            const amt = Number(pr.totalAmount) || 0;
            if (pr.purchaseId) {
                mappedReturns[pr.purchaseId] = (mappedReturns[pr.purchaseId] || 0) + amt;
            }
            else {
                unmappedReturns += amt;
            }
        });
        totalPaid += unmappedReturns;
        const openingBalance = Number(supplier.openingBalance) || 0;
        const isOpeningCredit = supplier.openingBalanceType === 'Cr';
        const isOpeningDebit = supplier.openingBalanceType === 'Dr';
        let bills = [];
        if (isOpeningCredit && openingBalance > 0) {
            bills.push({
                entryNo: 'Opening Balance',
                date: supplier.createdAt,
                total: openingBalance,
                returned: 0,
                received: 0,
                pending: openingBalance
            });
        }
        else if (isOpeningDebit && openingBalance > 0) {
            totalPaid += openingBalance;
        }
        const purchases = await this.prisma.purchase.findMany({
            where: {
                supplierId,
                paymentModeId: 4
            },
            orderBy: { date: 'asc' },
        });
        for (const purchase of purchases) {
            const billTotal = Number(purchase.grandTotal) || 0;
            const returnedAmt = mappedReturns[purchase.id] || 0;
            bills.push({
                entryNo: purchase.invoiceNo,
                date: purchase.date,
                total: billTotal,
                returned: returnedAmt,
                received: 0,
                pending: billTotal - returnedAmt
            });
        }
        for (const bill of bills) {
            const netBillTotal = Number((bill.total - (bill.returned || 0)).toFixed(2));
            const currentTotalPaid = Number(totalPaid.toFixed(2));
            if (netBillTotal <= 0) {
                bill.received = 0;
                bill.pending = 0;
                continue;
            }
            if (currentTotalPaid >= netBillTotal) {
                bill.received = netBillTotal;
                bill.pending = 0;
                totalPaid -= netBillTotal;
            }
            else if (currentTotalPaid > 0 && currentTotalPaid < netBillTotal) {
                bill.received = currentTotalPaid;
                bill.pending = Number((netBillTotal - currentTotalPaid).toFixed(2));
                totalPaid = 0;
            }
            else {
                bill.received = 0;
                bill.pending = netBillTotal;
            }
        }
        return bills;
    }
};
exports.SupplierPaymentsService = SupplierPaymentsService;
exports.SupplierPaymentsService = SupplierPaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupplierPaymentsService);
//# sourceMappingURL=supplier-payments.service.js.map