import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class UnitsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUnitDto: CreateUnitDto): import("@prisma/client").Prisma.Prisma__UnitClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortCode: string | null;
    }[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__UnitClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortCode: string | null;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, updateUnitDto: UpdateUnitDto): import("@prisma/client").Prisma.Prisma__UnitClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__UnitClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
