import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscription)
    private readonly subscriptionRepository: Repository<NewsletterSubscription>,
  ) {}

  async addSubscription(
    subscribeNewsletterDto: SubscribeNewsletterDto,
  ): Promise<NewsletterSubscription> {
    const { email, source } = subscribeNewsletterDto;

    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { email },
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        // Optionally, you could just return the existing active subscription
        // or throw a different type of error/message
        throw new ConflictException('This email is already subscribed.');
      } else {
        // If subscribed previously but not active, reactivate
        existingSubscription.isActive = true;
        existingSubscription.updatedAt = new Date();
        existingSubscription.source = source || existingSubscription.source; // Update source if provided
        try {
          return await this.subscriptionRepository.save(existingSubscription);
        } catch (error) {
          console.error(`Error reactivating subscription for ${email}:`, error);
          throw new InternalServerErrorException(
            'Could not reactivate subscription.',
          );
        }
      }
    }

    const newSubscription = this.subscriptionRepository.create({
      email,
      source,
    });

    try {
      return await this.subscriptionRepository.save(newSubscription);
    } catch (error) {
      // Catch potential unique constraint violation if a race condition occurs,
      // though the initial check should prevent most cases.
      if (error.code === '23505') {
        // PostgreSQL unique violation error code
        throw new ConflictException('This email is already subscribed.');
      }
      console.error(`Error creating new subscription for ${email}:`, error);
      throw new InternalServerErrorException('Could not subscribe email.');
    }
  }

  async unsubscribe(email: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { email },
    });

    if (!subscription) {
      // Optionally, you could throw a NotFoundException or just return silently
      console.warn(
        `[NewsletterService] Attempted to unsubscribe non-existent email: ${email}`,
      );
      return;
    }

    if (!subscription.isActive) {
      console.log(
        `[NewsletterService] Email ${email} is already unsubscribed.`,
      );
      return;
    }

    subscription.isActive = false;
    subscription.updatedAt = new Date();

    try {
      await this.subscriptionRepository.save(subscription);
      console.log(`[NewsletterService] Successfully unsubscribed ${email}.`);
    } catch (error) {
      console.error(`Error unsubscribing ${email}:`, error);
      throw new InternalServerErrorException('Could not unsubscribe email.');
    }
  }

  // Potential future methods:
  // async getSubscriptionStatus(email: string): Promise<{ isActive: boolean } | null>
  // async getAllSubscribers(options: { page: number, limit: number, filter?: string }): Promise<[NewsletterSubscription[], number]>
}
