"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode = __importStar(require("qrcode-terminal"));
let WhatsappService = WhatsappService_1 = class WhatsappService {
    client;
    logger = new common_1.Logger(WhatsappService_1.name);
    isReady = false;
    onModuleInit() {
        this.client = new whatsapp_web_js_1.Client({
            authStrategy: new whatsapp_web_js_1.LocalAuth({ dataPath: './.wwebjs_auth' }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu'],
            },
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
            }
        });
        this.client.on('qr', (qr) => {
            this.logger.log('QR Code received, please scan it to authenticate:');
            qrcode.generate(qr, { small: true });
        });
        this.client.on('ready', () => {
            this.isReady = true;
            this.logger.log('WhatsApp Client is ready!');
        });
        this.client.on('authenticated', () => {
            this.logger.log('WhatsApp Client authenticated successfully.');
        });
        this.client.on('auth_failure', (msg) => {
            this.logger.error('WhatsApp Authentication failure', msg);
        });
        this.client.on('disconnected', async (reason) => {
            this.isReady = false;
            this.logger.warn('WhatsApp Client was disconnected', reason);
            try {
                await this.client.destroy();
            }
            catch (e) {
            }
            setTimeout(() => {
                this.client.initialize().catch(e => this.logger.error('Re-init failed', e));
            }, 5000);
        });
        try {
            this.client.initialize().catch(e => this.logger.error('Init failed', e));
        }
        catch (e) {
            this.logger.error('Init failed synchronously', e);
        }
    }
    async sendPdf(phone, base64Pdf, filename, caption) {
        if (!this.isReady) {
            throw new common_1.BadRequestException('WhatsApp client is not ready yet. Please ensure the QR code is scanned in the server terminal.');
        }
        try {
            let formattedPhone = phone.replace(/\D/g, '');
            let contactId = await this.client.getNumberId(formattedPhone);
            if (!contactId && formattedPhone.length === 10) {
                contactId = await this.client.getNumberId(`91${formattedPhone}`);
            }
            if (!contactId && formattedPhone.startsWith('0')) {
                contactId = await this.client.getNumberId(`60${formattedPhone.substring(1)}`);
            }
            if (!contactId && formattedPhone.length === 9) {
                contactId = await this.client.getNumberId(`60${formattedPhone}`);
            }
            if (!contactId) {
                throw new Error('Phone number is not registered on WhatsApp. Please check the country code.');
            }
            const chatId = contactId._serialized;
            const base64Data = base64Pdf.includes('base64,')
                ? base64Pdf.split('base64,')[1]
                : base64Pdf;
            const media = new whatsapp_web_js_1.MessageMedia('application/pdf', base64Data, filename);
            await this.client.sendMessage(chatId, media, { caption });
            this.logger.log(`PDF successfully sent to ${phone}`);
            return { success: true, message: 'PDF sent successfully' };
        }
        catch (error) {
            this.logger.error(`Failed to send PDF to ${phone}`, error);
            throw new common_1.BadRequestException('Failed to send WhatsApp message. Please check the phone number.');
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)()
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map