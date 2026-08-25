import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): import("@prisma/client").Prisma.Prisma__ProductClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
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
    })[]>;
    getNextCode(): Promise<{
        code: string;
    }>;
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, updateProductDto: UpdateProductDto): import("@prisma/client").Prisma.Prisma__ProductClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ProductClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
