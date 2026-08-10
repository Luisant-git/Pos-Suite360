import { Injectable } from '@nestjs/common';
import { CreatePaymentModeDto } from './dto/create-payment-mode.dto';
import { UpdatePaymentModeDto } from './dto/update-payment-mode.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentModesService {
  constructor(private prisma: PrismaService) {}

  create(createPaymentModeDto: CreatePaymentModeDto) {
    return this.prisma.paymentMode.create({
      data: createPaymentModeDto,
    });
  }

  findAll() {
    return this.prisma.paymentMode.findMany({
      orderBy: { id: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.paymentMode.findUnique({
      where: { id },
    });
  }

  update(id: number, updatePaymentModeDto: UpdatePaymentModeDto) {
    return this.prisma.paymentMode.update({
      where: { id },
      data: updatePaymentModeDto,
    });
  }

  remove(id: number) {
    return this.prisma.paymentMode.delete({
      where: { id },
    });
  }
}
