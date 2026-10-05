import { CreateExpenseDto } from './dto/create-expense.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createExpenseDto: CreateExpenseDto): import("@prisma/client").Prisma.Prisma__ExpenseClient<{
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        expenseCategoryId: number;
        paymentModeId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(query?: any): import("@prisma/client").Prisma.PrismaPromise<({
        category: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
        };
        paymentMode: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
        };
    } & {
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        expenseCategoryId: number;
        paymentModeId: number;
    })[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__ExpenseClient<({
        category: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
        };
        paymentMode: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
        };
    } & {
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        expenseCategoryId: number;
        paymentModeId: number;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, updateData: any): Promise<{
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        expenseCategoryId: number;
        paymentModeId: number;
    }>;
}
