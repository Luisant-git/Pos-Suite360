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
      orderBy: [
        { date: 'desc' },
        { id: 'desc' }
      ],
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

  async getUnpaidBills(supplierId: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new BadRequestException('Supplier not found');
    }

    // 1. Get total paid
    const payments = await this.prisma.supplierPayment.aggregate({
      where: { supplierId },
      _sum: { amount: true },
    });
    let totalPaid = Number(payments._sum.amount) || 0;

    // 2. Fetch Opening Balance & Purchases (in chronological order)
    const openingBalance = Number(supplier.openingBalance) || 0;
    const isOpeningCredit = supplier.openingBalanceType === 'Cr'; // Cr means we owe them
    const isOpeningDebit = supplier.openingBalanceType === 'Dr';
    
    let bills: any[] = [];
    
    // If we owe them an opening balance, treat it as the first bill
    if (isOpeningCredit && openingBalance > 0) {
      bills.push({
        entryNo: 'Opening Balance',
        date: supplier.createdAt,
        total: openingBalance,
        received: 0,
        pending: openingBalance
      });
    } else if (isOpeningDebit && openingBalance > 0) {
      // If they owe us, this effectively increases our "totalPaid" pool
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

    // 3. Apply FIFO
    const unpaidBills = [];
    for (const bill of bills) {
      if (totalPaid >= bill.total) {
        // Fully paid
        bill.received = bill.total;
        bill.pending = 0;
        totalPaid -= bill.total;
      } else if (totalPaid > 0 && totalPaid < bill.total) {
        // Partially paid
        bill.received = totalPaid;
        bill.pending = bill.total - totalPaid;
        totalPaid = 0;
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
