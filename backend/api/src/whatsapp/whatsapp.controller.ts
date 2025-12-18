import { Controller, Post, Get, Body, Query, Res } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Response } from 'express';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    return this.whatsappService.handleIncomingMessage(body);
  }

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
    @Res() res: Response,
  ) {
    const isVerified = this.whatsappService.verifyWebhook(
      mode,
      challenge,
      verifyToken,
    );
    if (isVerified) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Failed to verify webhook token');
    }
  }
}
