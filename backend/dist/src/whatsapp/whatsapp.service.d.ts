import { OnModuleInit } from '@nestjs/common';
export declare class WhatsappService implements OnModuleInit {
    private client;
    private readonly logger;
    private isReady;
    onModuleInit(): void;
    sendPdf(phone: string, base64Pdf: string, filename: string, caption: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
