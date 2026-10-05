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
        collectionsInPeriod: number;
        productsCount: number;
        lowStockCount: number;
        billsToday: number;
        lowStockProducts: {
            id: number;
            name: any;
            code: any;
            currentStock: number;
            minStock: number;
        }[];
        chartData: {
            name: string;
            sales: number;
        }[];
        recentBankDeposits: {
            date: Date;
            amount: import("@prisma/client-runtime-utils").Decimal;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            depositType: string;
        }[];
        unpaidCustomerBills: any[];
        unpaidSupplierBills: any[];
    }>;
}
