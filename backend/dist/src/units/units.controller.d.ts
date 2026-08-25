import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
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
    findOne(id: string): import("@prisma/client").Prisma.Prisma__UnitClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortCode: string | null;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateUnitDto: UpdateUnitDto): import("@prisma/client").Prisma.Prisma__UnitClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__UnitClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
