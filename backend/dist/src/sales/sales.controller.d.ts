import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(createSaleDto: CreateSaleDto, req: any): Promise<{
        items: {
            tax: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            id: number;
            quantity: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            saleId: number;
        }[];
    } & {
        invoiceNo: string;
        date: Date;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        grandTotal: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        customerId: number;
        userId: number;
        paymentModeId: number;
    }>;
    findAll(query: any): import("@prisma/client").Prisma.PrismaPromise<({
        customer: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            contactPerson: string | null;
            phone: string | null;
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
        };
    } & {
        invoiceNo: string;
        date: Date;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        grandTotal: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        customerId: number;
        userId: number;
        paymentModeId: number;
    })[]>;
    getNextInvoiceNo(): Promise<{
        invoiceNo: string;
    }>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__SaleClient<({
        user: {
            id: number;
            name: string;
            username: string;
        };
        customer: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            contactPerson: string | null;
            phone: string | null;
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
        };
        items: ({
            product: {
                unit: {
                    createdAt: Date;
                    updatedAt: Date;
                    id: number;
                    name: string;
                    shortCode: string | null;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                code: string;
                barcode: string | null;
                categoryId: number;
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
            tax: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            id: number;
            quantity: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            saleId: number;
        })[];
    } & {
        invoiceNo: string;
        date: Date;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        grandTotal: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        customerId: number;
        userId: number;
        paymentModeId: number;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): Promise<{
        invoiceNo: string;
        date: Date;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        grandTotal: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        customerId: number;
        userId: number;
        paymentModeId: number;
    }>;
}
