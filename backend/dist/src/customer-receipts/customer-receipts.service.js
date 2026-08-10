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
        if (!data.receiptNo || !data.customerId || !data.amount || !data.paymentModeId) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        try {
            return await this.prisma.customerReceipt.create({
                data: {
                    receiptNo: data.receiptNo,
                    date: new Date(data.date || new Date()),
                    customerId: Number(data.customerId),
                    amount: Number(data.amount),
                    paymentModeId: Number(data.paymentModeId),
                    reference: data.reference,
                    remarks: data.remarks,
                    userId: userId,
                },
                include: {
                    customer: true,
                    paymentMode: true,
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
            orderBy: { date: 'desc' },
            include: {
                customer: true,
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
        const sales = await this.prisma.sale.aggregate({
            where: { customerId },
            _sum: { grandTotal: true },
        });
        const receipts = await this.prisma.customerReceipt.aggregate({
            where: { customerId },
            _sum: { amount: true },
        });
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
        const balance = totalOwed + totalSales - totalCollected;
        return { balance };
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
        const openingBalance = Number(customer.openingBalance) || 0;
        const isOpeningDebit = customer.openingBalanceType === 'Dr';
        const isOpeningCredit = customer.openingBalanceType === 'Cr';
        let bills = [];
        if (isOpeningDebit && openingBalance > 0) {
            bills.push({
                entryNo: 'Opening Balance',
                date: customer.createdAt,
                total: openingBalance,
                received: 0,
                pending: openingBalance
            });
        }
        else if (isOpeningCredit && openingBalance > 0) {
            totalCollected += openingBalance;
        }
        const sales = await this.prisma.sale.findMany({
            where: { customerId },
            orderBy: { date: 'asc' },
        });
        for (const sale of sales) {
            bills.push({
                entryNo: sale.invoiceNo,
                date: sale.date,
                total: Number(sale.grandTotal) || 0,
                received: 0,
                pending: Number(sale.grandTotal) || 0
            });
        }
        const unpaidBills = [];
        for (const bill of bills) {
            if (totalCollected >= bill.total) {
                bill.received = bill.total;
                bill.pending = 0;
                totalCollected -= bill.total;
            }
            else if (totalCollected > 0 && totalCollected < bill.total) {
                bill.received = totalCollected;
                bill.pending = bill.total - totalCollected;
                totalCollected = 0;
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
exports.CustomerReceiptsService = CustomerReceiptsService;
exports.CustomerReceiptsService = CustomerReceiptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerReceiptsService);
//# sourceMappingURL=customer-receipts.service.js.map