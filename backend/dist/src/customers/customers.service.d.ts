import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCustomerDto: CreateCustomerDto): import("@prisma/client").Prisma.Prisma__CustomerClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__CustomerClient<{
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
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, updateCustomerDto: UpdateCustomerDto): import("@prisma/client").Prisma.Prisma__CustomerClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__CustomerClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getCustomerRates(customerId: number): Promise<({
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
            minStock: import("@prisma/client-runtime-utils").Decimal;
            wholesaleRate: import("@prisma/client-runtime-utils").Decimal;
            reorderLevel: import("@prisma/client-runtime-utils").Decimal;
            currentStock: import("@prisma/client-runtime-utils").Decimal;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        productId: number;
        rate: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    upsertCustomerRate(customerId: number, productId: number, rate: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        productId: number;
        rate: import("@prisma/client-runtime-utils").Decimal;
    }>;
    setCustomerRates(customerId: number, rates: {
        productId: number;
        rate: number;
    }[]): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        productId: number;
        rate: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
}
