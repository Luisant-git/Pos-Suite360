import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(createSaleDto: CreateSaleDto, req: any): Promise<{
        items: {
            id: number;
            tax: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            quantity: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            saleId: number;
        }[];
    } & {
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
    }>;
    findAll(query: any): import("@prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    getNextInvoiceNo(): Promise<{
        invoiceNo: string;
    }>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__SaleClient<({
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
                purchaseRate: import("@prisma/client-runtime-utils").Decimal;
                sellingRate: import("@prisma/client-runtime-utils").Decimal;
                wholesaleRate: import("@prisma/client-runtime-utils").Decimal;
                mrp: import("@prisma/client-runtime-utils").Decimal;
                taxPercent: import("@prisma/client-runtime-utils").Decimal;
                minStock: number;
                reorderLevel: number;
                currentStock: number;
                categoryId: number;
                brandId: number | null;
                unitId: number;
            };
        } & {
            id: number;
            tax: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            quantity: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            saleId: number;
        })[];
        user: {
            id: number;
            name: string;
            username: string;
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
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): Promise<{
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
    }>;
}
