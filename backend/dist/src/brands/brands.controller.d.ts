import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
    create(createBrandDto: CreateBrandDto): import("@prisma/client").Prisma.Prisma__BrandClient<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: number | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        parent: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            parentId: number | null;
        } | null;
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: number | null;
    })[]>;
    findOne(id: string): Promise<{
        parent: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            parentId: number | null;
        } | null;
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: number | null;
    }>;
    update(id: string, updateBrandDto: UpdateBrandDto): import("@prisma/client").Prisma.Prisma__BrandClient<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: number | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__BrandClient<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: number | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
