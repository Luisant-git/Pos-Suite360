import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<{
        id: number;
        shopName: string;
        shopAddress: string | null;
        phone: string | null;
        email: string | null;
        currencySymbol: string;
        currencyPosition: string;
        invoicePrefix: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateSettings(data: any): Promise<{
        id: number;
        shopName: string;
        shopAddress: string | null;
        phone: string | null;
        email: string | null;
        currencySymbol: string;
        currencyPosition: string;
        invoicePrefix: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    resetDatabase(): Promise<{
        message: string;
    }>;
}
