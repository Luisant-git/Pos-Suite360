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
        const receipts = await this.prisma.customerReceipt.aggregate({
            where: { customerId },
            _sum: { amount: true },
        });
        let totalCollected = Number(receipts._sum.amount) || 0;
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
        totalCollected += unmappedReturns;
        const openingBalance = Number(customer.openingBalance) || 0;
        const isOpeningDebit = customer.openingBalanceType === 'Dr';
        const isOpeningCredit = customer.openingBalanceType === 'Cr';
        let bills = [];
        if (isOpeningDebit && openingBalance > 0) {
            bills.push({
                entryNo: 'Opening Balance',
                date: customer.createdAt,
                total: openingBalance,
                returned: 0,
                received: 0,
                pending: openingBalance
            });
        }
        else if (isOpeningCredit && openingBalance > 0) {
            totalCollected += openingBalance;
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
            bills.push({
                entryNo: sale.invoiceNo,
                date: sale.date,
                total: billTotal,
                returned: returnedAmt,
                received: 0,
                pending: billTotal - returnedAmt
            });
        }
        for (const bill of bills) {
            const netBillTotal = Number((bill.total - (bill.returned || 0)).toFixed(2));
            const currentTotalCollected = Number(totalCollected.toFixed(2));
            if (netBillTotal <= 0) {
                bill.received = 0;
                bill.pending = 0;
                continue;
            }
            if (currentTotalCollected >= netBillTotal) {
                bill.received = netBillTotal;
                bill.pending = 0;
                totalCollected -= netBillTotal;
            }
            else if (currentTotalCollected > 0 && currentTotalCollected < netBillTotal) {
                bill.received = currentTotalCollected;
                bill.pending = Number((netBillTotal - currentTotalCollected).toFixed(2));
                totalCollected = 0;
            }
            else {
                bill.received = 0;
                bill.pending = netBillTotal;
            }
        }
        return bills;
    }
};
exports.CustomerReceiptsService = CustomerReceiptsService;
exports.CustomerReceiptsService = CustomerReceiptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerReceiptsService);
//# sourceMappingURL=customer-receipts.service.js.map