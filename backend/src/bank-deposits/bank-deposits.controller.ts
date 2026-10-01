import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BankDepositsService } from './bank-deposits.service';

@Controller('bank-deposits')
export class BankDepositsController {
  constructor(private readonly bankDepositsService: BankDepositsService) {}

  @Post()
  create(@Body() createBankDepositDto: any) {
    return this.bankDepositsService.create(createBankDepositDto);
  }

  @Get()
  findAll(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.bankDepositsService.findAll(fromDate, toDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankDepositsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankDepositsService.remove(+id);
  }
}
