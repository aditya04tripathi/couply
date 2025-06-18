import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  // For multiple files, use the below line instead:
  // uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
  uploadFile(@UploadedFile() file: Express.Multer.File): string {
    console.log(file);
    return `File ${file.originalname} uploaded successfully!`;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
