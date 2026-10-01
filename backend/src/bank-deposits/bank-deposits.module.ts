import { Module } from '@nestjs/common';
import { BankDepositsService } from './bank-deposits.service';
import { BankDepositsController } from './bank-deposits.controller';

@Module({
  controllers: [BankDepositsController],
  providers: [BankDepositsService],
})
export class BankDepositsModule {}
