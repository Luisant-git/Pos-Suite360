import { PrismaService } from '../prisma/prisma.service';
export declare class CustomerReceiptsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, userId: number): Promise<{
        customer: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            contactPerson: string | null;
            phone: string;
            email: string | null;
            address: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            shippingAddress: string | null;
            creditLimit: import("@prisma/client-runtime-utils").Decimal;
            creditDays: number;
        };
        paymentType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null;
    } & {
        id: number;
        date: Date;
        paymentModeId: number | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        amount: import("@prisma/client-runtime-utils").Decimal;
        receiptNo: string;
        reference: string | null;
        remarks: string | null;
        paymentTypeId: number | null;
        userId: number;
    }>;
    findAll(): Promise<({
        paymentMode: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null;
        customer: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            contactPerson: string | null;
            phone: string;
            email: string | null;
            address: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            shippingAddress: string | null;
            creditLimit: import("@prisma/client-runtime-utils").Decimal;
            creditDays: number;
        };
        paymentType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null;
    } & {
        id: number;
        date: Date;
        paymentModeId: number | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        amount: import("@prisma/client-runtime-utils").Decimal;
        receiptNo: string;
        reference: string | null;
        remarks: string | null;
        paymentTypeId: number | null;
        userId: number;
    })[]>;
    getBalance(customerId: number): Promise<{
        balance: number;
        totalReturns: number;
    }>;
    generateReceiptNo(): Promise<string>;
    getUnpaidBills(customerId: number): Promise<any[]>;
    getConsolidationReport(startDate?: string, endDate?: string): Promise<{
        customerId: number;
        customerName: string;
        phone: string;
        openingBalance: number;
        openingBalanceType: string;
        totalSales: number;
        totalReceipts: number;
        totalReturns: number;
        netPending: number;
    }[]>;
}
