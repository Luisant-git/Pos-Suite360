import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(startDate?: string, endDate?: string): Promise<{
        cashSalesToday: number;
        creditSalesToday: number;
        cashPurchasesToday: number;
        creditPurchasesToday: number;
        pendingPayables: number;
        pendingReceivables: number;
        expensesToday: number;
        productsCount: number;
        lowStockCount: number;
        billsToday: number;
        lowStockProducts: {
            id: number;
            name: any;
            currentStock: number;
            minStock: number;
        }[];
        chartData: {
            name: string;
            sales: number;
        }[];
        unpaidCustomerBills: any[];
        unpaidSupplierBills: any[];
    }>;
}
