import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
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
    uploadSignature(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    resetDatabase(): Promise<{
        message: string;
    }>;
}
