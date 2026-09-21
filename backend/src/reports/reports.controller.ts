import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('profit-loss')
  async getProfitLoss(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.reportsService.getProfitLoss(fromDate, toDate);
  }

  @Get('product-wise-sales')
  async getProductWiseSales(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('productId') productId?: string,
  ) {
    return this.reportsService.getProductWiseSales(fromDate, toDate, productId ? Number(productId) : undefined);
  }
}
