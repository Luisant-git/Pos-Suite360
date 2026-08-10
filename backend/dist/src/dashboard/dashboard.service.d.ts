import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardSummary(): Promise<{
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
