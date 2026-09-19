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
exports.CustomerReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomerReceiptsService = class CustomerReceiptsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, userId) {
        if (!data.receiptNo || !data.customerId || !data.amount || !data.paymentTypeId) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        try {
            return await this.prisma.customerReceipt.create({
                data: {
                    receiptNo: data.receiptNo,
                    date: new Date(data.date || new Date()),
                    customerId: Number(data.customerId),
                    amount: Number(data.amount),
                    paymentTypeId: Number(data.paymentTypeId),
                    reference: data.reference,
                    remarks: data.remarks,
                    userId: userId,
                    allocations: data.allocations && Array.isArray(data.allocations) ? {
                        create: data.allocations.filter((a) => Number(a.amount) > 0).map((a) => ({
                            saleId: a.saleId ? Number(a.saleId) : null,
                            amount: Number(a.amount)
                        }))
                    } : undefined,
                },
                include: {
                    customer: true,
                    paymentType: true,
                },
            });
        }
        catch (error) {
            console.error('Error creating customer receipt:', error);
            throw new common_1.BadRequestException('Failed to record receipt. ' + (error.message || ''));
        }
    }
    async findAll() {
        return this.prisma.customerReceipt.findMany({
            orderBy: [
                { date: 'desc' },
                { id: 'desc' }
            ],
            include: {
                customer: true,
                paymentType: true,
                paymentMode: true,
            },
        });
    }
    async getBalance(customerId) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.BadRequestException('Customer not found');
        }
        const creditMode = await this.prisma.paymentMode.findFirst({
            where: { name: { equals: 'Credit', mode: 'insensitive' } }
        });
        const creditModeId = creditMode?.id || -1;
        const sales = await this.prisma.sale.aggregate({
            where: {
                customerId,
                paymentModeId: creditModeId
            },
            _sum: { grandTotal: true },
        });
        const receipts = await this.prisma.customerReceipt.aggregate({
            where: { customerId },
            _sum: { amount: true },
        });
        const salesReturns = await this.prisma.salesReturn.aggregate({
            where: { customerId },
            _sum: { totalAmount: true },
        });
        const totalReturns = Number(salesReturns._sum.totalAmount) || 0;
        const openingBalance = Number(customer.openingBalance) || 0;
        const isOpeningCredit = customer.openingBalanceType === 'Cr';
        const isOpeningDebit = customer.openingBalanceType === 'Dr';
        let totalOwed = 0;
        if (isOpeningDebit)
            totalOwed += openingBalance;
        if (isOpeningCredit)
            totalOwed -= openingBalance;
        const totalSales = Number(sales._sum.grandTotal) || 0;
        const totalCollected = Number(receipts._sum.amount) || 0;
        const balance = totalOwed + totalSales - totalCollected - totalReturns;
        return { balance, totalReturns };
    }
    async generateReceiptNo() {
        const lastReceipt = await this.prisma.customerReceipt.findFirst({
            orderBy: { id: 'desc' },
        });
        let nextNo = 1;
        if (lastReceipt && lastReceipt.receiptNo.startsWith('REC-')) {
            const parts = lastReceipt.receiptNo.split('-');
            if (parts.length === 2) {
                nextNo = parseInt(parts[1], 10) + 1;
            }
        }
        return `REC-${nextNo.toString().padStart(6, '0')}`;
    }
    async getUnpaidBills(customerId) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.BadRequestException('Customer not found');
        }
        const allReceipts = await this.prisma.customerReceipt.findMany({
            where: { customerId },
            include: { allocations: true }
        });
        let totalOldUnallocatedCollected = 0;
        allReceipts.forEach(r => {
            const receiptAmount = Number(r.amount) || 0;
            if (!r.allocations || r.allocations.length === 0) {
                totalOldUnallocatedCollected += receiptAmount;
            }
            else {
                const allocatedToBills = r.allocations.reduce((sum, a) => sum + (a.saleId ? Number(a.amount) : 0), 0);
                totalOldUnallocatedCollected += (receiptAmount - allocatedToBills);
            }
        });
        const salesReturns = await this.prisma.salesReturn.findMany({
            where: { customerId },
        });
        const mappedReturns = {};
        let unmappedReturns = 0;
        salesReturns.forEach(sr => {
            const amt = Number(sr.totalAmount) || 0;
            if (sr.saleId) {
                mappedReturns[sr.saleId] = (mappedReturns[sr.saleId] || 0) + amt;
            }
            else {
                unmappedReturns += amt;
            }
        });
        totalOldUnallocatedCollected += unmappedReturns;
        const allAllocations = await this.prisma.customerReceiptAllocation.findMany({
            where: {
                customerReceipt: { customerId }
            }
        });
        const mappedAllocations = {};
        allAllocations.forEach(a => {
            if (a.saleId) {
                mappedAllocations[a.saleId] = (mappedAllocations[a.saleId] || 0) + Number(a.amount);
            }
        });
        const openingBalance = Number(customer.openingBalance) || 0;
        const isOpeningDebit = customer.openingBalanceType === 'Dr';
        const isOpeningCredit = customer.openingBalanceType === 'Cr';
        let bills = [];
        if (isOpeningDebit && openingBalance > 0) {
            bills.push({
                id: 'OB',
                entryNo: 'Opening Balance',
                date: customer.createdAt,
                total: openingBalance,
                returned: 0,
                allocated: 0,
                received: 0,
                pending: openingBalance,
                isOpeningBalance: true
            });
        }
        else if (isOpeningCredit && openingBalance > 0) {
            totalOldUnallocatedCollected += openingBalance;
        }
        const creditMode = await this.prisma.paymentMode.findFirst({
            where: { name: { equals: 'Credit', mode: 'insensitive' } }
        });
        const creditModeId = creditMode?.id || -1;
        const sales = await this.prisma.sale.findMany({
            where: {
                customerId,
                paymentModeId: creditModeId
            },
            orderBy: { date: 'asc' },
        });
        for (const sale of sales) {
            const billTotal = Number(sale.grandTotal) || 0;
            const returnedAmt = mappedReturns[sale.id] || 0;
            const allocatedAmt = mappedAllocations[sale.id] || 0;
            bills.push({
                id: sale.id,
                entryNo: sale.invoiceNo,
                date: sale.date,
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
            const currentTotalCollected = Number(totalOldUnallocatedCollected.toFixed(2));
            bill.received = bill.allocated;
            if (remainingPending <= 0) {
                bill.pending = 0;
                continue;
            }
            if (currentTotalCollected >= remainingPending) {
                bill.received += remainingPending;
                bill.pending = 0;
                totalOldUnallocatedCollected -= remainingPending;
            }
            else if (currentTotalCollected > 0 && currentTotalCollected < remainingPending) {
                bill.received += currentTotalCollected;
                bill.pending = Number((remainingPending - currentTotalCollected).toFixed(2));
                totalOldUnallocatedCollected = 0;
            }
        }
        return bills;
    }
    async getConsolidationReport(startDate, endDate) {
        const customers = await this.prisma.customer.findMany({
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
        for (const c of customers) {
            let forwardingBalance = 0;
            const openingBal = Number(c.openingBalance) || 0;
            if (c.openingBalanceType === 'Dr')
                forwardingBalance += openingBal;
            if (c.openingBalanceType === 'Cr')
                forwardingBalance -= openingBal;
            if (start) {
                const preSales = await this.prisma.sale.aggregate({
                    where: { customerId: c.id, paymentModeId: creditModeId, date: { lt: start } },
                    _sum: { grandTotal: true },
                });
                const preReceipts = await this.prisma.customerReceipt.aggregate({
                    where: { customerId: c.id, date: { lt: start } },
                    _sum: { amount: true },
                });
                const preReturns = await this.prisma.salesReturn.aggregate({
                    where: { customerId: c.id, date: { lt: start } },
                    _sum: { totalAmount: true },
                });
                forwardingBalance += (Number(preSales._sum.grandTotal) || 0);
                forwardingBalance -= (Number(preReceipts._sum.amount) || 0);
                forwardingBalance -= (Number(preReturns._sum.totalAmount) || 0);
            }
            const displayOpeningBalance = Math.abs(forwardingBalance);
            const displayOpeningBalanceType = forwardingBalance >= 0 ? 'Dr' : 'Cr';
            const dateFilter = {};
            if (start)
                dateFilter.gte = start;
            if (end)
                dateFilter.lte = end;
            const hasDateFilter = start || end;
            const sales = await this.prisma.sale.aggregate({
                where: {
                    customerId: c.id,
                    paymentModeId: creditModeId,
                    ...(hasDateFilter ? { date: dateFilter } : {})
                },
                _sum: { grandTotal: true },
            });
            const receipts = await this.prisma.customerReceipt.aggregate({
                where: {
                    customerId: c.id,
                    ...(hasDateFilter ? { date: dateFilter } : {})
                },
                _sum: { amount: true },
            });
            const returns = await this.prisma.salesReturn.aggregate({
                where: {
                    customerId: c.id,
                    ...(hasDateFilter ? { date: dateFilter } : {})
                },
                _sum: { totalAmount: true },
            });
            const totalSales = Number(sales._sum.grandTotal) || 0;
            const totalReceipts = Number(receipts._sum.amount) || 0;
            const totalReturns = Number(returns._sum.totalAmount) || 0;
            const netPending = forwardingBalance + totalSales - totalReceipts - totalReturns;
            report.push({
                customerId: c.id,
                customerName: c.name,
                phone: c.phone || '-',
                openingBalance: Number(displayOpeningBalance.toFixed(2)),
                openingBalanceType: displayOpeningBalanceType,
                totalSales: Number(totalSales.toFixed(2)),
                totalReceipts: Number(totalReceipts.toFixed(2)),
                totalReturns: Number(totalReturns.toFixed(2)),
                netPending: Number(netPending.toFixed(2)),
            });
        }
        return report;
    }
};
exports.CustomerReceiptsService = CustomerReceiptsService;
exports.CustomerReceiptsService = CustomerReceiptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerReceiptsService);
//# sourceMappingURL=customer-receipts.service.js.map