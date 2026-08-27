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
        yearlyInvoiceReset: boolean;
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
        yearlyInvoiceReset: boolean;
    }>;
    resetDatabase(type: string): Promise<{
        message: string;
    }>;
}
