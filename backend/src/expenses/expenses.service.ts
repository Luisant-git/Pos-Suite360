import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  create(createExpenseDto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        date: new Date(createExpenseDto.date),
        expenseCategoryId: createExpenseDto.expenseCategoryId,
        amount: createExpenseDto.amount,
        paymentModeId: createExpenseDto.paymentModeId,
        notes: createExpenseDto.notes,
      },
    });
  }

  findAll(query?: any) {
    const where: any = {};
    if (query?.startDate || query?.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }
    if (query?.categoryId) {
      where.expenseCategoryId = Number(query.categoryId);
    }
    if (query?.search) {
      where.OR = [
        { notes: { contains: query.search, mode: 'insensitive' } },
        { category: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.expense.findMany({
      where,
      include: {
        category: true,
        paymentMode: true,
      },
      orderBy: [
        { date: 'desc' },
        { id: 'desc' }
      ],
    });
  }

  findOne(id: number) {
    return this.prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
        paymentMode: true,
      },
    });
  }
}
