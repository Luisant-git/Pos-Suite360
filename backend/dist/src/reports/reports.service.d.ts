import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfitLoss(fromDateStr?: string, toDateStr?: string): Promise<{
        grossSales: number;
        totalSalesReturns: number;
        netOperatingRevenue: number;
        grossPurchases: number;
        totalPurchaseReturns: number;
        netCogs: number;
        grossProfit: number;
        itemizedExpenses: {
            name: string;
            amount: number;
        }[];
        totalExpenses: number;
        netProfit: number;
    }>;
}
