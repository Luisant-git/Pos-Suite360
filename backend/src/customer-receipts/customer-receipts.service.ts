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
}
