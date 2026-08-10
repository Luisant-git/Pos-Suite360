import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(username: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    create(username: string, pass: string): Promise<User>;
    updatePassword(userId: number, hash: string): Promise<User>;
}
