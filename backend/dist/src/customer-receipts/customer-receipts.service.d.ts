import { PrismaService } from '../prisma/prisma.service';
export declare class CustomerReceiptsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, userId: number): Promise<{
        paymentMode: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        };
        customer: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            contactPerson: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            shippingAddress: string | null;
            creditLimit: import("@prisma/client-runtime-utils").Decimal;
            creditDays: number;
        };
    } & {
        id: number;
        date: Date;
        paymentModeId: number;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        userId: number;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        remarks: string | null;
        receiptNo: string;
    }>;
    findAll(): Promise<({
        paymentMode: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        };
        customer: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            contactPerson: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            shippingAddress: string | null;
            creditLimit: import("@prisma/client-runtime-utils").Decimal;
            creditDays: number;
        };
    } & {
        id: number;
        date: Date;
        paymentModeId: number;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        userId: number;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        remarks: string | null;
        receiptNo: string;
    })[]>;
    getBalance(customerId: number): Promise<{
        balance: number;
    }>;
    generateReceiptNo(): Promise<string>;
    getUnpaidBills(customerId: number): Promise<any[]>;
}
