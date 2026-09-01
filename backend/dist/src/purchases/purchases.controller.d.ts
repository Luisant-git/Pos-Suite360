import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    create(createPurchaseDto: CreatePurchaseDto, req: any): Promise<{
        items: {
            id: number;
            tax: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            purchaseId: number;
            productId: number;
            quantity: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
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
    }>;
    findAll(query: any): import("@prisma/client").Prisma.PrismaPromise<({
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
        paymentMode: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        };
    } & {
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
    })[]>;
    getNextEntryNo(): Promise<{
        entryNo: string;
    }>;
    getLatestRate(productId: string): Promise<{
        id: number;
        tax: import("@prisma/client-runtime-utils").Decimal;
        amount: import("@prisma/client-runtime-utils").Decimal;
        purchaseId: number;
        productId: number;
        quantity: number;
        rate: import("@prisma/client-runtime-utils").Decimal;
    } | null>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__PurchaseClient<({
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
        paymentMode: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        };
        items: ({
            product: {
                unit: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    shortCode: string | null;
                };
            } & {
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
            tax: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            purchaseId: number;
            productId: number;
            quantity: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
        })[];
    } & {
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
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): Promise<{
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
    }>;
}
