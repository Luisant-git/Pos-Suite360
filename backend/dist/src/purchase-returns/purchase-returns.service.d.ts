import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class PurchaseReturnsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPurchaseReturnDto: CreatePurchaseReturnDto): Promise<{
        items: {
            id: number;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            returnQty: number;
            purchaseReturnId: number;
        }[];
    } & {
        id: number;
        date: Date;
        supplierId: number;
        createdAt: Date;
        updatedAt: Date;
        remarks: string | null;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        returnNo: string;
        purchaseId: number | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        purchase: {
            id: number;
            invoiceNo: string;
            date: Date;
            supplierInvoiceNo: string | null;
            invoiceDate: Date | null;
            supplierId: number;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            tax: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            grandTotal: import("@prisma/client-runtime-utils").Decimal;
            paymentModeId: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        supplier: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            email: string | null;
            address: string | null;
            gstNumber: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            contactPerson: string | null;
            openingBalanceType: string;
            accountNo: string | null;
            ifscCode: string | null;
            bankBranch: string | null;
        };
        items: ({
            product: {
                id: number;
                supplierId: number | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                barcode: string | null;
                categoryId: number | null;
                brandId: number | null;
                unitId: number;
                purchaseRate: import("@prisma/client-runtime-utils").Decimal;
                sellingRate: import("@prisma/client-runtime-utils").Decimal;
                mrp: import("@prisma/client-runtime-utils").Decimal;
                taxPercent: import("@prisma/client-runtime-utils").Decimal;
                minStock: number;
                wholesaleRate: import("@prisma/client-runtime-utils").Decimal;
                reorderLevel: number;
                currentStock: number;
            };
        } & {
            id: number;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            returnQty: number;
            purchaseReturnId: number;
        })[];
    } & {
        id: number;
        date: Date;
        supplierId: number;
        createdAt: Date;
        updatedAt: Date;
        remarks: string | null;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        returnNo: string;
        purchaseId: number | null;
    })[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__PurchaseReturnClient<({
        purchase: {
            id: number;
            invoiceNo: string;
            date: Date;
            supplierInvoiceNo: string | null;
            invoiceDate: Date | null;
            supplierId: number;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            tax: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            grandTotal: import("@prisma/client-runtime-utils").Decimal;
            paymentModeId: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        supplier: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            email: string | null;
            address: string | null;
            gstNumber: string | null;
            openingBalance: import("@prisma/client-runtime-utils").Decimal;
            contactPerson: string | null;
            openingBalanceType: string;
            accountNo: string | null;
            ifscCode: string | null;
            bankBranch: string | null;
        };
        items: ({
            product: {
                id: number;
                supplierId: number | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                barcode: string | null;
                categoryId: number | null;
                brandId: number | null;
                unitId: number;
                purchaseRate: import("@prisma/client-runtime-utils").Decimal;
                sellingRate: import("@prisma/client-runtime-utils").Decimal;
                mrp: import("@prisma/client-runtime-utils").Decimal;
                taxPercent: import("@prisma/client-runtime-utils").Decimal;
                minStock: number;
                wholesaleRate: import("@prisma/client-runtime-utils").Decimal;
                reorderLevel: number;
                currentStock: number;
            };
        } & {
            id: number;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            returnQty: number;
            purchaseReturnId: number;
        })[];
    } & {
        id: number;
        date: Date;
        supplierId: number;
        createdAt: Date;
        updatedAt: Date;
        remarks: string | null;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        returnNo: string;
        purchaseId: number | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getNextReturnNo(): Promise<string>;
}
