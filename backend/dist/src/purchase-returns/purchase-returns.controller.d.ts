import { PurchaseReturnsService } from './purchase-returns.service';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
export declare class PurchaseReturnsController {
    private readonly purchaseReturnsService;
    constructor(purchaseReturnsService: PurchaseReturnsService);
    create(createPurchaseReturnDto: CreatePurchaseReturnDto): Promise<{
        items: {
            id: number;
            returnQty: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            purchaseReturnId: number;
        }[];
    } & {
        returnNo: string;
        date: Date;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        purchaseId: number | null;
        supplierId: number;
    }>;
    getNextCode(): Promise<string>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        supplier: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
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
        purchase: {
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            supplierId: number;
            invoiceNo: string;
            supplierInvoiceNo: string | null;
            invoiceDate: Date | null;
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
                supplierId: number | null;
                name: string;
                code: string;
                barcode: string | null;
                categoryId: number | null;
                brandId: number | null;
                unitId: number;
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
            purchaseReturnId: number;
        })[];
    } & {
        returnNo: string;
        date: Date;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        purchaseId: number | null;
        supplierId: number;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__PurchaseReturnClient<({
        supplier: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
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
        purchase: {
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            supplierId: number;
            invoiceNo: string;
            supplierInvoiceNo: string | null;
            invoiceDate: Date | null;
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
                supplierId: number | null;
                name: string;
                code: string;
                barcode: string | null;
                categoryId: number | null;
                brandId: number | null;
                unitId: number;
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
            purchaseReturnId: number;
        })[];
    } & {
        returnNo: string;
        date: Date;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        purchaseId: number | null;
        supplierId: number;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
