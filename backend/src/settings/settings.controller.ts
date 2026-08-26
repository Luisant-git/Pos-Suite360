import { Controller, Get, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Post()
  async updateSettings(@Body() data: any) {
    return this.settingsService.updateSettings(data);
  }

  @Post('upload-signature')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/signatures',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadSignature(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const baseUrl = process.env.UPLOAD_URL || 'http://localhost:3000/uploads';
    return {
      url: `${baseUrl}/signatures/${file.filename}`
    };
  }

  @Post('verify-dev-password')
  async verifyDevPassword(@Body('password') password: string) {
    const devPassword = process.env.DEV_PASSWORD || 'developer123';
    if (password !== devPassword) {
      throw new BadRequestException('Invalid Developer Password');
    }
    return { success: true };
  }

  @Post('reset-database')
  async resetDatabase(@Body() data: { type: string; password?: string }) {
    const devPassword = process.env.DEV_PASSWORD || 'developer123';
    if (data.password !== devPassword) {
      throw new BadRequestException('Invalid Developer Password');
    }
    return this.settingsService.resetDatabase(data.type);
  }
}
