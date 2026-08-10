import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(): Promise<{
        salesToday: number;
        purchasesToday: number;
        expensesToday: number;
        productsCount: number;
        lowStockCount: number;
        billsToday: number;
        topProducts: {
            name: any;
            salesCount: number;
            amount: number;
        }[];
        chartData: {
            name: string;
            sales: number;
        }[];
    }>;
}
