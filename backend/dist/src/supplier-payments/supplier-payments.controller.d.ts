import { SupplierPaymentsService } from './supplier-payments.service';
export declare class SupplierPaymentsController {
    private readonly supplierPaymentsService;
    constructor(supplierPaymentsService: SupplierPaymentsService);
    getNextPaymentNo(): Promise<{
        paymentNo: string;
    }>;
    getBalance(id: string): Promise<{
        balance: number;
        totalReturns: number;
    }>;
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
    getUnpaidBills(id: string): Promise<any[]>;
    create(createSupplierPaymentDto: any, req: any): Promise<{
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
    update(id: string, updateData: any, req: any): Promise<{
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
}
