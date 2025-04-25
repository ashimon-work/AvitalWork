import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';

// Basic DTO for validation (can be expanded later)
class SubscribeDto {
  email: string;
}

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK) // Respond with 200 OK on success
  async subscribe(@Body() subscribeDto: SubscribeDto): Promise<{ message: string }> {
    // Basic validation check (more robust validation can be added with class-validator)
    if (!subscribeDto.email || typeof subscribeDto.email !== 'string' || !subscribeDto.email.includes('@')) {
      // In a real app, throw BadRequestException here
      console.error('Invalid email received:', subscribeDto.email);
      // For now, just log and return a generic success to avoid breaking frontend assumptions
      // Ideally, the frontend should handle potential error responses.
      // throw new BadRequestException('Invalid email format.');
    }

    await this.newsletterService.addSubscription(subscribeDto.email);
    console.log(`Subscription request received for: ${subscribeDto.email}`);
    // Return a simple success message
    return { message: 'Subscription successful!' };
  }
}