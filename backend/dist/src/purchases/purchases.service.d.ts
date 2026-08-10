import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class PurchasesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPurchaseDto: CreatePurchaseDto): Promise<{
        items: {
            id: number;
            tax: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            quantity: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            purchaseId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        supplierId: number;
        grandTotal: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        paymentModeId: number;
        invoiceNo: string;
        date: Date;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        supplier: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        supplierId: number;
        grandTotal: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        paymentModeId: number;
        invoiceNo: string;
        date: Date;
    })[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__PurchaseClient<({
        supplier: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        items: ({
            product: {
                unit: {
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    shortCode: string | null;
                };
            } & {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                barcode: string | null;
                categoryId: number;
                brandId: number | null;
                unitId: number;
                purchaseRate: import("@prisma/client-runtime-utils").Decimal;
                sellingRate: import("@prisma/client-runtime-utils").Decimal;
                mrp: import("@prisma/client-runtime-utils").Decimal;
                taxPercent: import("@prisma/client-runtime-utils").Decimal;
                minStock: number;
                supplierId: number | null;
                wholesaleRate: import("@prisma/client-runtime-utils").Decimal;
                reorderLevel: number;
                currentStock: number;
            };
        } & {
            id: number;
            tax: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            quantity: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            purchaseId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        supplierId: number;
        grandTotal: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        paymentModeId: number;
        invoiceNo: string;
        date: Date;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
