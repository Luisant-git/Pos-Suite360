import { Injectable, BadRequestException } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async create(createPurchaseDto: CreatePurchaseDto) {
    // Execute in a transaction to guarantee data integrity between purchase and stock ledger
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Purchase and PurchaseItems
      const purchase = await tx.purchase.create({
        data: {
          invoiceNo: createPurchaseDto.invoiceNo,
          date: new Date(createPurchaseDto.date),
          supplierId: createPurchaseDto.supplierId,
          paymentModeId: createPurchaseDto.paymentModeId,
          subtotal: createPurchaseDto.subtotal,
          tax: createPurchaseDto.tax || 0,
          discount: createPurchaseDto.discount || 0,
          grandTotal: createPurchaseDto.grandTotal,
          items: {
            create: createPurchaseDto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              rate: item.rate,
              tax: item.tax || 0,
              amount: item.amount,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Update stock and ledger for each item
      for (const item of createPurchaseDto.items) {
        // Increment current stock
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { increment: item.quantity },
          },
        });

        // Add ledger entry
        await tx.stockTransaction.create({
          data: {
            date: new Date(createPurchaseDto.date),
            productId: item.productId,
            type: TransactionType.PURCHASE,
            quantityIn: item.quantity,
            quantityOut: 0,
            balance: updatedProduct.currentStock,
            reference: purchase.invoiceNo,
          },
        });
      }

      return purchase;
    });
  }

  findAll() {
    return this.prisma.purchase.findMany({
      include: {
        supplier: true,
        paymentMode: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        paymentMode: true,
        items: {
          include: {
            product: {
              include: {
                unit: true
              }
            },
          },
        },
      },
    });
  }
}
