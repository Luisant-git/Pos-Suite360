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
        yearlyInvoiceReset: boolean;
        allowEditSaleInvoice: boolean;
        enableCustomerRates: boolean;
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
        allowEditSaleInvoice: boolean;
        enableCustomerRates: boolean;
    }>;
    uploadSignature(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    verifyDevPassword(password: string): Promise<{
        success: boolean;
    }>;
    resetDatabase(data: {
        type: string;
        password?: string;
    }): Promise<{
        message: string;
    }>;
}
