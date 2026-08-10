import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupplierPaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: number) {
    // Basic validation
    if (!data.paymentNo || !data.supplierId || !data.amount || !data.paymentModeId) {
      throw new BadRequestException('Missing required fields');
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
    } catch (error) {
      console.error('Error creating supplier payment:', error);
      throw new BadRequestException('Failed to record payment. ' + (error.message || ''));
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

  async getBalance(supplierId: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new BadRequestException('Supplier not found');
    }

    // Sum of all purchases
    const purchases = await this.prisma.purchase.aggregate({
      where: { supplierId },
      _sum: { grandTotal: true },
    });

    // Sum of all payments
    const payments = await this.prisma.supplierPayment.aggregate({
      where: { supplierId },
      _sum: { amount: true },
    });

    const openingBalance = Number(supplier.openingBalance) || 0;
    const isOpeningCredit = supplier.openingBalanceType === 'Cr'; // Cr means we owe them
    const isOpeningDebit = supplier.openingBalanceType === 'Dr'; // Dr means they owe us
    
    let totalOwed = 0;
    if (isOpeningCredit) totalOwed += openingBalance;
    if (isOpeningDebit) totalOwed -= openingBalance;

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
}
