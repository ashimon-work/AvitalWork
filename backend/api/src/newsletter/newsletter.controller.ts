import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe, Delete, Param, NotFoundException } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to the newsletter' })
  @ApiBody({ type: SubscribeNewsletterDto })
  @ApiResponse({ status: 201, description: 'Successfully subscribed.', type: NewsletterSubscription })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 409, description: 'Email already subscribed.' })
  async subscribe(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) subscribeDto: SubscribeNewsletterDto,
  ): Promise<NewsletterSubscription> {
    return this.newsletterService.addSubscription(subscribeDto);
  }

  @Delete('unsubscribe/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from the newsletter' })
  @ApiParam({ name: 'email', description: 'Email address to unsubscribe', type: String })
  @ApiResponse({ status: 200, description: 'Successfully unsubscribed.' })
  @ApiResponse({ status: 404, description: 'Email not found or not subscribed.' })
  async unsubscribe(@Param('email') email: string): Promise<{ message: string }> {
    // Basic email validation, can be enhanced with a DTO and ValidationPipe if more params are added
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw new NotFoundException('Valid email must be provided for unsubscribing.');
    }
    await this.newsletterService.unsubscribe(email);
    return { message: `Email ${email} successfully unsubscribed.` };
  }
}