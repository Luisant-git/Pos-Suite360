import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class BrandsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createBrandDto: CreateBrandDto): import("@prisma/client").Prisma.Prisma__BrandClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        parentId: number | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        parent: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            parentId: number | null;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        parentId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        parent: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            parentId: number | null;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        parentId: number | null;
    }>;
    update(id: number, updateBrandDto: UpdateBrandDto): import("@prisma/client").Prisma.Prisma__BrandClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        parentId: number | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__BrandClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        parentId: number | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
