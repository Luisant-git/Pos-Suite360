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
    getUnpaidBills(id: string): Promise<any[]>;
    create(createSupplierPaymentDto: any, req: any): Promise<{
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
        supplierId: number;
        paymentModeId: number | null;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        remarks: string | null;
        paymentTypeId: number | null;
        userId: number;
        paymentNo: string;
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
        } | null;
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
        supplierId: number;
        paymentModeId: number | null;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
        remarks: string | null;
        paymentTypeId: number | null;
        userId: number;
        paymentNo: string;
    })[]>;
}
