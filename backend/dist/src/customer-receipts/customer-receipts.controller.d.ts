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
    getUnpaidBills(id: string): Promise<any[]>;
    create(createCustomerReceiptDto: any, req: any): Promise<{
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
    update(id: string, updateData: any, req: any): Promise<{
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
}
