import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: CreateProductDto): import("@prisma/client").Prisma.Prisma__ProductClient<{
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
        categoryId: number | null;
        brandId: number | null;
        unitId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getNextCode(): Promise<{
        code: string;
    }>;
    findAll(query?: any): import("@prisma/client").Prisma.PrismaPromise<({
        supplier: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
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
        } | null;
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            parentId: number | null;
        } | null;
        brand: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            parentId: number | null;
        } | null;
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
        categoryId: number | null;
        brandId: number | null;
        unitId: number;
    })[]>;
    findOne(id: number): Promise<{
        supplier: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
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
        } | null;
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            parentId: number | null;
        } | null;
        brand: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            parentId: number | null;
        } | null;
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
        categoryId: number | null;
        brandId: number | null;
        unitId: number;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): import("@prisma/client").Prisma.Prisma__ProductClient<{
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
        categoryId: number | null;
        brandId: number | null;
        unitId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__ProductClient<{
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
        categoryId: number | null;
        brandId: number | null;
        unitId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
