import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        email: string | null;
        shopName: string;
        shopAddress: string | null;
        currencySymbol: string;
        currencyPosition: string;
        invoicePrefix: string;
        invoiceNotes: string | null;
        signatureImage: string | null;
    }>;
    updateSettings(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        email: string | null;
        shopName: string;
        shopAddress: string | null;
        currencySymbol: string;
        currencyPosition: string;
        invoicePrefix: string;
        invoiceNotes: string | null;
        signatureImage: string | null;
    }>;
    resetDatabase(): Promise<{
        message: string;
    }>;
}
