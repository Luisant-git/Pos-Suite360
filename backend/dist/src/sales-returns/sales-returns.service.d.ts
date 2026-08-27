import { CreateSalesReturnDto } from './dto/create-sales-return.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class SalesReturnsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSalesReturnDto: CreateSalesReturnDto): Promise<{
        items: {
            id: number;
            amount: import("@prisma/client-runtime-utils").Decimal;
            rate: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            returnQty: number;
            salesReturnId: number;
        }[];
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
        remarks: string | null;
        customerId: number;
        userId: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        saleId: number | null;
        returnNo: string;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        items: ({
            product: {
                id: number;
                supplierId: number | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                barcode: string | null;
                purchaseRate: import("@prisma/client-runtime-utils").Decimal;
                sellingRate: import("@prisma/client-runtime-utils").Decimal;
                wholesaleRate: import("@prisma/client-runtime-utils").Decimal;
                mrp: import("@prisma/client-runtime-utils").Decimal;
                taxPercent: import("@prisma/client-runtime-utils").Decimal;
                minStock: number;
                reorderLevel: number;
                currentStock: number;
                categoryId: number | null;
                brandId: number | null;
                unitId: number;
            };
        } & {
            id: number;
            amount: import("@prisma/client-runtime-utils").Decimal;
            rate: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            returnQty: number;
            salesReturnId: number;
        })[];
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
        sale: {
            id: number;
            invoiceNo: string;
            date: Date;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            tax: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            grandTotal: import("@prisma/client-runtime-utils").Decimal;
            paymentModeId: number;
            createdAt: Date;
            updatedAt: Date;
            customerId: number;
            userId: number;
        } | null;
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
        remarks: string | null;
        customerId: number;
        userId: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        saleId: number | null;
        returnNo: string;
    })[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__SalesReturnClient<({
        items: ({
            product: {
                id: number;
                supplierId: number | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                barcode: string | null;
                purchaseRate: import("@prisma/client-runtime-utils").Decimal;
                sellingRate: import("@prisma/client-runtime-utils").Decimal;
                wholesaleRate: import("@prisma/client-runtime-utils").Decimal;
                mrp: import("@prisma/client-runtime-utils").Decimal;
                taxPercent: import("@prisma/client-runtime-utils").Decimal;
                minStock: number;
                reorderLevel: number;
                currentStock: number;
                categoryId: number | null;
                brandId: number | null;
                unitId: number;
            };
        } & {
            id: number;
            amount: import("@prisma/client-runtime-utils").Decimal;
            rate: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            returnQty: number;
            salesReturnId: number;
        })[];
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
        sale: {
            id: number;
            invoiceNo: string;
            date: Date;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            tax: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            grandTotal: import("@prisma/client-runtime-utils").Decimal;
            paymentModeId: number;
            createdAt: Date;
            updatedAt: Date;
            customerId: number;
            userId: number;
        } | null;
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
        remarks: string | null;
        customerId: number;
        userId: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        saleId: number | null;
        returnNo: string;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getNextReturnNo(): Promise<string>;
}
