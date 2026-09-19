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
                    allocations: data.allocations && Array.isArray(data.allocations) ? {
                        create: data.allocations.filter((a) => Number(a.amount) > 0).map((a) => ({
                            purchaseId: a.purchaseId ? Number(a.purchaseId) : null,
                            amount: Number(a.amount)
                        }))
                    } : undefined,
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
        const creditMode = await this.prisma.paymentMode.findFirst({
            where: { name: { equals: 'Credit', mode: 'insensitive' } }
        });
        const creditModeId = creditMode?.id || -1;
        const purchases = await this.prisma.purchase.aggregate({
            where: {
                supplierId,
                paymentModeId: creditModeId
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
        const allPayments = await this.prisma.supplierPayment.findMany({
            where: { supplierId },
            include: { allocations: true }
        });
        let totalOldUnallocatedPaid = 0;
        allPayments.forEach(p => {
            const paymentAmount = Number(p.amount) || 0;
            if (!p.allocations || p.allocations.length === 0) {
                totalOldUnallocatedPaid += paymentAmount;
            }
            else {
                const allocatedToBills = p.allocations.reduce((sum, a) => sum + (a.purchaseId ? Number(a.amount) : 0), 0);
                totalOldUnallocatedPaid += (paymentAmount - allocatedToBills);
            }
        });
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
        totalOldUnallocatedPaid += unmappedReturns;
        const allAllocations = await this.prisma.supplierPaymentAllocation.findMany({
            where: {
                supplierPayment: { supplierId }
            }
        });
        const mappedAllocations = {};
        allAllocations.forEach(a => {
            if (a.purchaseId) {
                mappedAllocations[a.purchaseId] = (mappedAllocations[a.purchaseId] || 0) + Number(a.amount);
            }
        });
        const openingBalance = Number(supplier.openingBalance) || 0;
        const isOpeningCredit = supplier.openingBalanceType === 'Cr';
        const isOpeningDebit = supplier.openingBalanceType === 'Dr';
        let bills = [];
        if (isOpeningCredit && openingBalance > 0) {
            bills.push({
                id: 'OB',
                entryNo: 'Opening Balance',
                date: supplier.createdAt,
                total: openingBalance,
                returned: 0,
                allocated: 0,
                received: 0,
                pending: openingBalance,
                isOpeningBalance: true
            });
        }
        else if (isOpeningDebit && openingBalance > 0) {
            totalOldUnallocatedPaid += openingBalance;
        }
        const creditMode = await this.prisma.paymentMode.findFirst({
            where: { name: { equals: 'Credit', mode: 'insensitive' } }
        });
        const creditModeId = creditMode?.id || -1;
        const purchases = await this.prisma.purchase.findMany({
            where: {
                supplierId,
                paymentModeId: creditModeId
            },
            orderBy: { date: 'asc' },
        });
        for (const purchase of purchases) {
            const billTotal = Number(purchase.grandTotal) || 0;
            const returnedAmt = mappedReturns[purchase.id] || 0;
            const allocatedAmt = mappedAllocations[purchase.id] || 0;
            bills.push({
                id: purchase.id,
                entryNo: purchase.invoiceNo,
                date: purchase.date,
                total: billTotal,
                returned: returnedAmt,
                allocated: allocatedAmt,
                received: 0,
                pending: billTotal - returnedAmt - allocatedAmt,
                isOpeningBalance: false
            });
        }
        for (const bill of bills) {
            const remainingPending = bill.pending;
            const currentTotalPaid = Number(totalOldUnallocatedPaid.toFixed(2));
            bill.received = bill.allocated;
            if (remainingPending <= 0) {
                bill.pending = 0;
                continue;
            }
            if (currentTotalPaid >= remainingPending) {
                bill.received += remainingPending;
                bill.pending = 0;
                totalOldUnallocatedPaid -= remainingPending;
            }
            else if (currentTotalPaid > 0 && currentTotalPaid < remainingPending) {
                bill.received += currentTotalPaid;
                bill.pending = Number((remainingPending - currentTotalPaid).toFixed(2));
                totalOldUnallocatedPaid = 0;
            }
        }
        return bills;
    }
    async getConsolidationReport(startDate, endDate) {
        const suppliers = await this.prisma.supplier.findMany({
            orderBy: { name: 'asc' },
        });
        const creditMode = await this.prisma.paymentMode.findFirst({
            where: { name: { equals: 'Credit', mode: 'insensitive' } }
        });
        const creditModeId = creditMode?.id || -1;
        const report = [];
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (end)
            end.setHours(23, 59, 59, 999);
        for (const s of suppliers) {
            let forwardingBalance = 0;
            const openingBal = Number(s.openingBalance) || 0;
            if (s.openingBalanceType === 'Cr')
                forwardingBalance += openingBal;
            if (s.openingBalanceType === 'Dr')
                forwardingBalance -= openingBal;
            if (start) {
                const prePurchases = await this.prisma.purchase.aggregate({
                    where: { supplierId: s.id, paymentModeId: creditModeId, date: { lt: start } },
                    _sum: { grandTotal: true },
                });
                const prePayments = await this.prisma.supplierPayment.aggregate({
                    where: { supplierId: s.id, date: { lt: start } },
                    _sum: { amount: true },
                });
                const preReturns = await this.prisma.purchaseReturn.aggregate({
                    where: { supplierId: s.id, date: { lt: start } },
                    _sum: { totalAmount: true },
                });
                forwardingBalance += (Number(prePurchases._sum.grandTotal) || 0);
                forwardingBalance -= (Number(prePayments._sum.amount) || 0);
                forwardingBalance -= (Number(preReturns._sum.totalAmount) || 0);
            }
            const displayOpeningBalance = Math.abs(forwardingBalance);
            const displayOpeningBalanceType = forwardingBalance >= 0 ? 'Cr' : 'Dr';
            const dateFilter = {};
            if (start)
                dateFilter.gte = start;
            if (end)
                dateFilter.lte = end;
            const hasDateFilter = start || end;
            const purchases = await this.prisma.purchase.aggregate({
                where: {
                    supplierId: s.id,
                    paymentModeId: creditModeId,
                    ...(hasDateFilter ? { date: dateFilter } : {})
                },
                _sum: { grandTotal: true },
            });
            const payments = await this.prisma.supplierPayment.aggregate({
                where: {
                    supplierId: s.id,
                    ...(hasDateFilter ? { date: dateFilter } : {})
                },
                _sum: { amount: true },
            });
            const returns = await this.prisma.purchaseReturn.aggregate({
                where: {
                    supplierId: s.id,
                    ...(hasDateFilter ? { date: dateFilter } : {})
                },
                _sum: { totalAmount: true },
            });
            const totalPurchases = Number(purchases._sum.grandTotal) || 0;
            const totalPayments = Number(payments._sum.amount) || 0;
            const totalReturns = Number(returns._sum.totalAmount) || 0;
            const netPending = forwardingBalance + totalPurchases - totalPayments - totalReturns;
            report.push({
                supplierId: s.id,
                supplierName: s.name,
                phone: s.phone || '-',
                openingBalance: Number(displayOpeningBalance.toFixed(2)),
                openingBalanceType: displayOpeningBalanceType,
                totalPurchases: Number(totalPurchases.toFixed(2)),
                totalPayments: Number(totalPayments.toFixed(2)),
                totalReturns: Number(totalReturns.toFixed(2)),
                netPending: Number(netPending.toFixed(2)),
            });
        }
        return report;
    }
};
exports.SupplierPaymentsService = SupplierPaymentsService;
exports.SupplierPaymentsService = SupplierPaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupplierPaymentsService);
//# sourceMappingURL=supplier-payments.service.js.map