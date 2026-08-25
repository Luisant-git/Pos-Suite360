import { CustomerReceiptsService } from './customer-receipts.service';
export declare class CustomerReceiptsController {
    private readonly customerReceiptsService;
    constructor(customerReceiptsService: CustomerReceiptsService);
    getNextReceiptNo(): Promise<{
        receiptNo: string;
    }>;
    getBalance(id: string): Promise<{
        balance: number;
        totalReturns: number;
    }>;
    getUnpaidBills(id: string): Promise<any[]>;
    create(createCustomerReceiptDto: any, req: any): Promise<{
        customer: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            address: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            contactPerson: string | null;
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
        userId: number;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentTypeId: number | null;
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
        } | null;
        customer: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            address: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            contactPerson: string | null;
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
        userId: number;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentTypeId: number | null;
        reference: string | null;
        remarks: string | null;
        receiptNo: string;
    })[]>;
}
