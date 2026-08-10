import { PrismaService } from '../prisma/prisma.service';
export declare class SupplierPaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, userId: number): Promise<{
        supplier: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            contactPerson: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            gstNumber: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            accountNo: string | null;
            ifscCode: string | null;
            bankBranch: string | null;
        };
        paymentMode: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        };
    } & {
        id: number;
        date: Date;
        supplierId: number;
        paymentModeId: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        paymentNo: string;
        remarks: string | null;
    }>;
    findAll(): Promise<({
        supplier: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            contactPerson: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            gstNumber: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            accountNo: string | null;
            ifscCode: string | null;
            bankBranch: string | null;
        };
        paymentMode: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        };
    } & {
        id: number;
        date: Date;
        supplierId: number;
        paymentModeId: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        paymentNo: string;
        remarks: string | null;
    })[]>;
    getBalance(supplierId: number): Promise<{
        balance: number;
    }>;
    generatePaymentNo(): Promise<string>;
    getUnpaidBills(supplierId: number): Promise<any[]>;
}
