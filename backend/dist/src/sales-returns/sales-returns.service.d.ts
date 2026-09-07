import { CreateSalesReturnDto } from './dto/create-sales-return.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class SalesReturnsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSalesReturnDto: CreateSalesReturnDto): Promise<{
        items: {
            id: number;
            returnQty: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            salesReturnId: number;
        }[];
    } & {
        returnNo: string;
        date: Date;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        saleId: number | null;
        customerId: number;
        userId: number;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
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
        sale: {
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            customerId: number;
            userId: number;
            invoiceNo: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            tax: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            grandTotal: import("@prisma/client-runtime-utils").Decimal;
            paymentModeId: number;
        } | null;
        items: ({
            product: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                code: string;
                barcode: string | null;
                categoryId: number | null;
                brandId: number | null;
                unitId: number;
                supplierId: number | null;
                purchaseRate: import("@prisma/client-runtime-utils").Decimal;
                sellingRate: import("@prisma/client-runtime-utils").Decimal;
                wholesaleRate: import("@prisma/client-runtime-utils").Decimal;
                mrp: import("@prisma/client-runtime-utils").Decimal;
                taxPercent: import("@prisma/client-runtime-utils").Decimal;
                minStock: number;
                reorderLevel: number;
                currentStock: number;
            };
        } & {
            id: number;
            returnQty: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            salesReturnId: number;
        })[];
    } & {
        returnNo: string;
        date: Date;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        saleId: number | null;
        customerId: number;
        userId: number;
    })[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__SalesReturnClient<({
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
        sale: {
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            customerId: number;
            userId: number;
            invoiceNo: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            tax: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            grandTotal: import("@prisma/client-runtime-utils").Decimal;
            paymentModeId: number;
        } | null;
        items: ({
            product: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                code: string;
                barcode: string | null;
                categoryId: number | null;
                brandId: number | null;
                unitId: number;
                supplierId: number | null;
                purchaseRate: import("@prisma/client-runtime-utils").Decimal;
                sellingRate: import("@prisma/client-runtime-utils").Decimal;
                wholesaleRate: import("@prisma/client-runtime-utils").Decimal;
                mrp: import("@prisma/client-runtime-utils").Decimal;
                taxPercent: import("@prisma/client-runtime-utils").Decimal;
                minStock: number;
                reorderLevel: number;
                currentStock: number;
            };
        } & {
            id: number;
            returnQty: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            salesReturnId: number;
        })[];
    } & {
        returnNo: string;
        date: Date;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        saleId: number | null;
        customerId: number;
        userId: number;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getNextReturnNo(): Promise<string>;
}
