import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ExpenseCategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createExpenseCategoryDto: CreateExpenseCategoryDto): import("@prisma/client").Prisma.Prisma__ExpenseCategoryClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__ExpenseCategoryClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, updateExpenseCategoryDto: UpdateExpenseCategoryDto): import("@prisma/client").Prisma.Prisma__ExpenseCategoryClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__ExpenseCategoryClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
