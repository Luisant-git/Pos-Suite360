import { Injectable } from '@nestjs/common';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private prisma: PrismaService) {}

  create(createExpenseCategoryDto: CreateExpenseCategoryDto) {
    return this.prisma.expenseCategory.create({
      data: createExpenseCategoryDto as any,
    });
  }

  findAll(query?: any) {
    const expenseWhere: any = {};
    if (query?.startDate || query?.endDate) {
      expenseWhere.date = {};
      if (query.startDate) expenseWhere.date.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        expenseWhere.date.lte = end;
      }
    }

    return this.prisma.expenseCategory.findMany({
      include: {
        expenses: {
          where: expenseWhere,
          select: {
            id: true,
            amount: true,
            date: true,
            notes: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.expenseCategory.findUnique({ where: { id } });
  }

  update(id: number, updateExpenseCategoryDto: UpdateExpenseCategoryDto) {
    return this.prisma.expenseCategory.update({
      where: { id },
      data: updateExpenseCategoryDto as any,
    });
  }

  remove(id: number) {
    return this.prisma.expenseCategory.delete({ where: { id } });
  }
}
