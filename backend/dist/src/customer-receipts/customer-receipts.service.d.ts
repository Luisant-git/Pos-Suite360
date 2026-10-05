import { PrismaService } from '../prisma/prisma.service';
export declare class CustomerReceiptsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, userId: number): Promise<{
        customer: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            contactPerson: string | null;
            phone: string;
            email: string | null;
            address: string | null;
            shippingAddress: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            creditLimit: import("@prisma/client-runtime-utils").Decimal;
            creditDays: number;
        };
        paymentType: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
        } | null;
    } & {
        receiptNo: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        customerId: number;
        paymentModeId: number | null;
        paymentTypeId: number | null;
        userId: number;
    }>;
    update(id: number, data: any, userId: number): Promise<{
        customer: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            contactPerson: string | null;
            phone: string;
            email: string | null;
            address: string | null;
            shippingAddress: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            creditLimit: import("@prisma/client-runtime-utils").Decimal;
            creditDays: number;
        };
        paymentType: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
        } | null;
    } & {
        receiptNo: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        customerId: number;
        paymentModeId: number | null;
        paymentTypeId: number | null;
        userId: number;
    }>;
    findAll(): Promise<({
        customer: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            contactPerson: string | null;
            phone: string;
            email: string | null;
            address: string | null;
            shippingAddress: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            creditLimit: import("@prisma/client-runtime-utils").Decimal;
            creditDays: number;
        };
        paymentMode: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
        } | null;
        paymentType: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
        } | null;
        allocations: ({
            sale: {
                date: Date;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                customerId: number;
                paymentModeId: number;
                userId: number;
                invoiceNo: string;
                subtotal: import("@prisma/client-runtime-utils").Decimal;
                tax: import("@prisma/client-runtime-utils").Decimal;
                discount: import("@prisma/client-runtime-utils").Decimal;
                grandTotal: import("@prisma/client-runtime-utils").Decimal;
            } | null;
        } & {
            amount: import("@prisma/client-runtime-utils").Decimal;
            createdAt: Date;
            id: number;
            saleId: number | null;
            customerReceiptId: number;
        })[];
    } & {
        receiptNo: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        customerId: number;
        paymentModeId: number | null;
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
