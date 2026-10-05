import { PrismaService } from '../prisma/prisma.service';
export declare class SupplierPaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, userId: number): Promise<{
        paymentType: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
        } | null;
        supplier: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            contactPerson: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            gstNumber: string | null;
            accountNo: string | null;
            ifscCode: string | null;
            bankBranch: string | null;
        };
    } & {
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        paymentModeId: number | null;
        paymentTypeId: number | null;
        userId: number;
        paymentNo: string;
        supplierId: number;
    }>;
    update(id: number, data: any, userId: number): Promise<{
        paymentType: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
        } | null;
        supplier: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            contactPerson: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            gstNumber: string | null;
            accountNo: string | null;
            ifscCode: string | null;
            bankBranch: string | null;
        };
    } & {
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        paymentModeId: number | null;
        paymentTypeId: number | null;
        userId: number;
        paymentNo: string;
        supplierId: number;
    }>;
    findAll(): Promise<({
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
        supplier: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            contactPerson: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            openingBalanceType: string;
            gstNumber: string | null;
            accountNo: string | null;
            ifscCode: string | null;
            bankBranch: string | null;
        };
    } & {
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        paymentModeId: number | null;
        paymentTypeId: number | null;
        userId: number;
        paymentNo: string;
        supplierId: number;
    })[]>;
    getBalance(supplierId: number): Promise<{
        balance: number;
        totalReturns: number;
    }>;
    generatePaymentNo(): Promise<string>;
    getUnpaidBills(supplierId: number): Promise<any[]>;
    getConsolidationReport(startDate?: string, endDate?: string): Promise<{
        supplierId: number;
        supplierName: string;
        phone: string;
        openingBalance: number;
        openingBalanceType: string;
        totalPurchases: number;
        totalPayments: number;
        totalReturns: number;
        netPending: number;
    }[]>;
}
