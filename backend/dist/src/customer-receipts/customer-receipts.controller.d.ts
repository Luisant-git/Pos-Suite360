import { CustomerReceiptsService } from './customer-receipts.service';
export declare class CustomerReceiptsController {
    private readonly customerReceiptsService;
    constructor(customerReceiptsService: CustomerReceiptsService);
    getNextReceiptNo(): Promise<{
        receiptNo: string;
    }>;
    getBalance(id: string): Promise<{
        balance: number;
    }>;
    getUnpaidBills(id: string): Promise<any[]>;
    create(createCustomerReceiptDto: any, req: any): Promise<{
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
}
