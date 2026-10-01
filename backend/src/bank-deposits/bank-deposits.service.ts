import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankDepositsService {
  constructor(private prisma: PrismaService) {}

  create(createBankDepositDto: any) {
    return this.prisma.bankDeposit.create({
      data: {
        date: createBankDepositDto.date ? new Date(createBankDepositDto.date) : new Date(),
        amount: createBankDepositDto.amount,
        depositType: createBankDepositDto.depositType,
      },
    });
  }

  findAll(fromDate?: string, toDate?: string) {
    const where: any = {};
    if (fromDate && toDate) {
      where.date = {
        gte: new Date(fromDate),
        lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
      };
    }
    return this.prisma.bankDeposit.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.bankDeposit.findUnique({
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.bankDeposit.delete({
      where: { id },
    });
  }
}
