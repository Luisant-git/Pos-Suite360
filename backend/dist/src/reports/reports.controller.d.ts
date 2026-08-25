import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getProfitLoss(fromDate?: string, toDate?: string): Promise<{
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
