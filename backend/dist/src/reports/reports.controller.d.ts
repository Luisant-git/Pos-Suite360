import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getProfitLoss(fromDate?: string, toDate?: string): Promise<{
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
    getProductWiseSales(fromDate?: string, toDate?: string, productId?: string): Promise<unknown[]>;
}
