import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(username: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    findAll(): Promise<({
        role: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            permissions: string[];
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        password: string;
        username: string;
        roleId: number;
    })[]>;
    create(username: string, pass: string): Promise<User>;
    createUser(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        password: string;
        username: string;
        roleId: number;
    }>;
    updatePassword(userId: number, hash: string): Promise<User>;
    updateUser(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        password: string;
        username: string;
        roleId: number;
    }>;
    deleteUser(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        password: string;
        username: string;
        roleId: number;
    }>;
}
