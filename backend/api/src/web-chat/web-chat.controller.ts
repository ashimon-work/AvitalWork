import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { WebChatService } from './web-chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNotEmpty, IsString } from 'class-validator';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

interface AuthenticatedRequest extends Request {
  user: {
    id: string; // User ID from JWT payload
  };
}

@Controller('web-chat')
export class WebChatController {
  constructor(private readonly webChatService: WebChatService) {}

  @Get('simulator')
  getSimulator(@Res() res: Response) {
    // Serve the HTML file from the public directory
    // Try multiple possible paths to handle both dev and production environments
    // In production Docker: process.cwd() = /usr/src/app, public is at /usr/src/app/backend/api/public
    // In development: process.cwd() might be /usr/src/app or /usr/src/app/backend/api
    let publicPath = join(process.cwd(), 'backend', 'api', 'public', 'index.html');
    
    // Fallback: if running from backend/api directory
    if (!existsSync(publicPath)) {
      publicPath = join(process.cwd(), 'public', 'index.html');
    }
    
    // Another fallback: relative to __dirname (compiled location)
    if (!existsSync(publicPath)) {
      publicPath = join(__dirname, '..', '..', '..', 'public', 'index.html');
    }
    
    res.sendFile(publicPath);
  }

  @UseGuards(JwtAuthGuard)
  @Post('message')
  async handleMessage(
    @Request() req: AuthenticatedRequest,
    @Body(new ValidationPipe()) body: SendMessageDto,
  ) {
    const developerId = req.user.id;
    return this.webChatService.handleDeveloperMessage(
      developerId,
      body.message,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Request() req: AuthenticatedRequest) {
    return this.webChatService.getHistory(req.user.id);
  }
}

