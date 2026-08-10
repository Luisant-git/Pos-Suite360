import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto, userId: number) {
    // Execute in a transaction to guarantee data integrity between sale and stock ledger
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Sale and SaleItems
      const sale = await tx.sale.create({
        data: {
          invoiceNo: createSaleDto.invoiceNo,
          date: new Date(createSaleDto.date),
          customerId: createSaleDto.customerId,
          userId: userId,
          paymentModeId: createSaleDto.paymentModeId,
          subtotal: createSaleDto.subtotal,
          tax: createSaleDto.tax || 0,
          discount: createSaleDto.discount || 0,
          grandTotal: createSaleDto.grandTotal,
          items: {
            create: createSaleDto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              rate: item.rate,
              discount: item.discount || 0,
              tax: item.tax || 0,
              amount: item.amount,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Update stock and ledger for each item
      for (const item of createSaleDto.items) {
        // Decrement current stock (allow negative stock to let checkout proceed)
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });

        // Add ledger entry
        await tx.stockTransaction.create({
          data: {
            date: new Date(createSaleDto.date),
            productId: item.productId,
            type: TransactionType.SALE,
            quantityIn: 0,
            quantityOut: item.quantity,
            balance: updatedProduct.currentStock,
            reference: sale.invoiceNo,
          },
        });
      }

      return sale;
    });
  }

  findAll() {
    return this.prisma.sale.findMany({
      include: {
        customer: true,
        paymentMode: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        paymentMode: true,
        user: {
          select: { id: true, name: true, username: true }
        },
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
