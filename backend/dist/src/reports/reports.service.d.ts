import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfitLoss(fromDateStr?: string, toDateStr?: string): Promise<{
        grossSales: number;
        totalSalesReturns: number;
        netOperatingRevenue: number;
        openingStockValue: number;
        grossPurchases: number;
        totalPurchaseReturns: number;
        closingStockValue: number;
        netCogs: number;
        grossProfit: number;
        itemizedExpenses: {
            name: string;
            amount: number;
        }[];
        totalExpenses: number;
        netProfit: number;
    }>;
    getProductWiseSales(fromDate?: string, toDate?: string, productId?: number): Promise<unknown[]>;
}
