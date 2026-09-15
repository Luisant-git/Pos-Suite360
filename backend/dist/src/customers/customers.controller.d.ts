import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
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
    findOne(id: string): import("@prisma/client").Prisma.Prisma__CustomerClient<{
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
    update(id: string, updateCustomerDto: UpdateCustomerDto): import("@prisma/client").Prisma.Prisma__CustomerClient<{
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
    remove(id: string): import("@prisma/client").Prisma.Prisma__CustomerClient<{
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
    getCustomerRates(id: string): Promise<({
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
    setCustomerRates(id: string, body: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        productId: number;
        rate: import("@prisma/client-runtime-utils").Decimal;
    }> | never[] | Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        productId: number;
        rate: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
}
