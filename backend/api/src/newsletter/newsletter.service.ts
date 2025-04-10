import { Injectable } from '@nestjs/common';

@Injectable()
export class NewsletterService {
  async addSubscription(email: string): Promise<void> {
    // In a real application, this would interact with a database
    // or an email marketing service API (e.g., Mailchimp, SendGrid).
    console.log(`[NewsletterService] Adding subscription for: ${email}`);
    // Simulate async operation if needed
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate DB call
  }
}