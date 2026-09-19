import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupplierPaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: number) {
    // Basic validation
    if (!data.paymentNo || !data.supplierId || !data.amount || !data.paymentTypeId) {
      throw new BadRequestException('Missing required fields');
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
            create: data.allocations.filter((a: any) => Number(a.amount) > 0).map((a: any) => ({
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
        paymentType: true,
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

    const creditMode = await this.prisma.paymentMode.findFirst({
      where: { name: { equals: 'Credit', mode: 'insensitive' } }
    });
    const creditModeId = creditMode?.id || -1;

    // Sum of all CREDIT purchases
    const purchases = await this.prisma.purchase.aggregate({
      where: { 
        supplierId,
        paymentModeId: creditModeId
      },
      _sum: { grandTotal: true },
    });

    // Sum of all payments
    const payments = await this.prisma.supplierPayment.aggregate({
      where: { supplierId },
      _sum: { amount: true },
    });

    // Sum of all purchase returns
    const purchaseReturns = await this.prisma.purchaseReturn.aggregate({
      where: { supplierId },
      _sum: { totalAmount: true },
    });

    const openingBalance = Number(supplier.openingBalance) || 0;
    const isOpeningCredit = supplier.openingBalanceType === 'Cr'; // Cr means we owe them
    const isOpeningDebit = supplier.openingBalanceType === 'Dr'; // Dr means they owe us
    
    let totalOwed = 0;
    if (isOpeningCredit) totalOwed += openingBalance;
    if (isOpeningDebit) totalOwed -= openingBalance;

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

  async getUnpaidBills(supplierId: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new BadRequestException('Supplier not found');
    }

    // 1. Get total paid using all payments to calculate unallocated amounts
    const allPayments = await this.prisma.supplierPayment.findMany({
      where: { supplierId },
      include: { allocations: true }
    });
    
    let totalOldUnallocatedPaid = 0;
    allPayments.forEach(p => {
      const paymentAmount = Number(p.amount) || 0;
      if (!p.allocations || p.allocations.length === 0) {
        totalOldUnallocatedPaid += paymentAmount;
      } else {
        const allocatedToBills = p.allocations.reduce((sum, a) => sum + (a.purchaseId ? Number(a.amount) : 0), 0);
        totalOldUnallocatedPaid += (paymentAmount - allocatedToBills);
      }
    });

    const purchaseReturns = await this.prisma.purchaseReturn.findMany({
      where: { supplierId },
    });
    
    const mappedReturns: Record<number, number> = {};
    let unmappedReturns = 0;
    
    purchaseReturns.forEach(pr => {
      const amt = Number(pr.totalAmount) || 0;
      if (pr.purchaseId) {
        mappedReturns[pr.purchaseId] = (mappedReturns[pr.purchaseId] || 0) + amt;
      } else {
        unmappedReturns += amt;
      }
    });

    // We add unmapped returns to the total pool of unallocated credits
    totalOldUnallocatedPaid += unmappedReturns;

    // Get specific bill allocations
    const allAllocations = await this.prisma.supplierPaymentAllocation.findMany({
      where: {
        supplierPayment: { supplierId }
      }
    });
    
    const mappedAllocations: Record<number, number> = {};
    allAllocations.forEach(a => {
      if (a.purchaseId) {
        mappedAllocations[a.purchaseId] = (mappedAllocations[a.purchaseId] || 0) + Number(a.amount);
      }
    });

    // 2. Fetch Opening Balance & Purchases (in chronological order)
    const openingBalance = Number(supplier.openingBalance) || 0;
    const isOpeningCredit = supplier.openingBalanceType === 'Cr'; // Cr means we owe them
    const isOpeningDebit = supplier.openingBalanceType === 'Dr';
    
    let bills: any[] = [];
    
    // If we owe them an opening balance, treat it as the first bill
    if (isOpeningCredit && openingBalance > 0) {
      bills.push({
        id: 'OB', // Special ID for opening balance
        entryNo: 'Opening Balance',
        date: supplier.createdAt,
        total: openingBalance,
        returned: 0,
        allocated: 0, // Opening balance has no direct allocations right now
        received: 0,
        pending: openingBalance,
        isOpeningBalance: true
      });
    } else if (isOpeningDebit && openingBalance > 0) {
      // If they owe us, this effectively increases our "totalPaid" pool
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
        received: 0, // This will be calculated including FIFO
        pending: billTotal - returnedAmt - allocatedAmt,
        isOpeningBalance: false
      });
    }

    // 3. Apply FIFO for the old unallocated payments over the remaining pending balances
    for (const bill of bills) {
      const remainingPending = bill.pending;
      const currentTotalPaid = Number(totalOldUnallocatedPaid.toFixed(2));
      
      // Calculate total received initially from specific allocations
      bill.received = bill.allocated;

      if (remainingPending <= 0) {
         bill.pending = 0;
         continue;
      }

      if (currentTotalPaid >= remainingPending) {
        // Fully paid by FIFO
        bill.received += remainingPending;
        bill.pending = 0;
        totalOldUnallocatedPaid -= remainingPending;
      } else if (currentTotalPaid > 0 && currentTotalPaid < remainingPending) {
        // Partially paid by FIFO
        bill.received += currentTotalPaid;
        bill.pending = Number((remainingPending - currentTotalPaid).toFixed(2));
        totalOldUnallocatedPaid = 0;
      }
    }

    return bills;
  }

  async getConsolidationReport() {
    const suppliers = await this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });

    const creditMode = await this.prisma.paymentMode.findFirst({
      where: { name: { equals: 'Credit', mode: 'insensitive' } }
    });
    const creditModeId = creditMode?.id || -1;

    const report = [];

    for (const s of suppliers) {
      const purchases = await this.prisma.purchase.aggregate({
        where: { supplierId: s.id, paymentModeId: creditModeId },
        _sum: { grandTotal: true },
      });
      const payments = await this.prisma.supplierPayment.aggregate({
        where: { supplierId: s.id },
        _sum: { amount: true },
      });
      const returns = await this.prisma.purchaseReturn.aggregate({
        where: { supplierId: s.id },
        _sum: { totalAmount: true },
      });

      const openingBal = Number(s.openingBalance) || 0;
      const totalPurchases = Number(purchases._sum.grandTotal) || 0;
      const totalPayments = Number(payments._sum.amount) || 0;
      const totalReturns = Number(returns._sum.totalAmount) || 0;

      let netOwed = 0;
      if (s.openingBalanceType === 'Cr') netOwed += openingBal;
      if (s.openingBalanceType === 'Dr') netOwed -= openingBal;

      const netPending = netOwed + totalPurchases - totalPayments - totalReturns;

      report.push({
        supplierId: s.id,
        supplierName: s.name,
        phone: s.phone || '-',
        openingBalance: openingBal,
        openingBalanceType: s.openingBalanceType,
        totalPurchases,
        totalPayments,
        totalReturns,
        netPending,
      });
    }

    return report;
  }
}
