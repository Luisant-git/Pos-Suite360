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
    private getTopUnpaidCustomerBills;
    private getTopUnpaidSupplierBills;
}
