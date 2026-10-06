import { PrismaService } from '../prisma/prisma.service';
import { CustomerReceiptsService } from '../customer-receipts/customer-receipts.service';
import { SupplierPaymentsService } from '../supplier-payments/supplier-payments.service';
export declare class DashboardService {
    private prisma;
    private customerReceiptsService;
    private supplierPaymentsService;
    constructor(prisma: PrismaService, customerReceiptsService: CustomerReceiptsService, supplierPaymentsService: SupplierPaymentsService);
    getDashboardSummary(startDateStr?: string, endDateStr?: string): Promise<{
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
            id: number;
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client-runtime-utils").Decimal;
            depositType: string;
        }[];
        unpaidCustomerBills: any[];
        unpaidSupplierBills: any[];
    }>;
    private getTopUnpaidCustomerBills;
    private getTopUnpaidSupplierBills;
}
