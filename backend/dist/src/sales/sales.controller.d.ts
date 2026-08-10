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
            productId: number;
            quantity: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            saleId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        grandTotal: import("@prisma/client-runtime-utils").Decimal;
        customerId: number;
        userId: number;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        paymentModeId: number;
        invoiceNo: string;
        date: Date;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        customer: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
        grandTotal: import("@prisma/client-runtime-utils").Decimal;
        customerId: number;
        userId: number;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        paymentModeId: number;
        invoiceNo: string;
        date: Date;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__SaleClient<({
        user: {
            id: number;
            name: string;
            username: string;
        };
        customer: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
            discount: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
            productId: number;
            quantity: number;
            rate: import("@prisma/client-runtime-utils").Decimal;
            saleId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        grandTotal: import("@prisma/client-runtime-utils").Decimal;
        customerId: number;
        userId: number;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tax: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        paymentModeId: number;
        invoiceNo: string;
        date: Date;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
