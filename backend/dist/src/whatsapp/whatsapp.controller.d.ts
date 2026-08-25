import { WhatsappService } from './whatsapp.service';
export declare class SendPdfDto {
    phone: string;
    base64Pdf: string;
    filename: string;
    caption: string;
}
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    sendPdf(body: SendPdfDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
