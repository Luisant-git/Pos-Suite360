import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerReceiptsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: number) {
    if (!data.receiptNo || !data.customerId || !data.amount || !data.paymentModeId) {
      throw new BadRequestException('Missing required fields');
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
    } catch (error) {
      console.error('Error creating customer receipt:', error);
      throw new BadRequestException('Failed to record receipt. ' + (error.message || ''));
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

  async getBalance(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    // Sum of all sales
    const sales = await this.prisma.sale.aggregate({
      where: { customerId },
      _sum: { grandTotal: true },
    });

    // Sum of all receipts
    const receipts = await this.prisma.customerReceipt.aggregate({
      where: { customerId },
      _sum: { amount: true },
    });

    const openingBalance = Number(customer.openingBalance) || 0;
    const isOpeningCredit = customer.openingBalanceType === 'Cr'; // Cr means we owe them
    const isOpeningDebit = customer.openingBalanceType === 'Dr'; // Dr means they owe us
    
    let totalOwed = 0;
    if (isOpeningDebit) totalOwed += openingBalance;
    if (isOpeningCredit) totalOwed -= openingBalance;

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

  async getUnpaidBills(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    // 1. Get total collected
    const receipts = await this.prisma.customerReceipt.aggregate({
      where: { customerId },
      _sum: { amount: true },
    });
    let totalCollected = Number(receipts._sum.amount) || 0;

    // 2. Fetch Opening Balance & Sales (in chronological order)
    const openingBalance = Number(customer.openingBalance) || 0;
    const isOpeningDebit = customer.openingBalanceType === 'Dr'; // Dr means they owe us
    const isOpeningCredit = customer.openingBalanceType === 'Cr';
    
    let bills: any[] = [];
    
    // If they owe us an opening balance, treat it as the first bill
    if (isOpeningDebit && openingBalance > 0) {
      bills.push({
        entryNo: 'Opening Balance',
        date: customer.createdAt, // Or a specific OB date if available
        total: openingBalance,
        received: 0,
        pending: openingBalance
      });
    } else if (isOpeningCredit && openingBalance > 0) {
      // If we owe them, this effectively increases their "totalCollected" pool
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

    // 3. Apply FIFO
    const unpaidBills = [];
    for (const bill of bills) {
      if (totalCollected >= bill.total) {
        // Fully paid
        bill.received = bill.total;
        bill.pending = 0;
        totalCollected -= bill.total;
      } else if (totalCollected > 0 && totalCollected < bill.total) {
        // Partially paid
        bill.received = totalCollected;
        bill.pending = bill.total - totalCollected;
        totalCollected = 0;
        unpaidBills.push(bill);
      } else {
        // Completely unpaid
        bill.received = 0;
        bill.pending = bill.total;
        unpaidBills.push(bill);
      }
    }

    return unpaidBills;
  }
}
