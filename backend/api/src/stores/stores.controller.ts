import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Param,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoreEntity } from './entities/store.entity';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { AboutContentEntity } from './entities/about-content.entity';
import { TestimonialEntity } from './entities/testimonial.entity';

@Controller('store') // StoreContextGuard removed from controller level
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // Note: Search and findBySlug endpoints might need to be moved or adapted for storefront if they are used there.
  // Keeping them here for now as they were in the original file.

  // This endpoint should likely not be guarded by StoreContextGuard at controller level,
  // as it's for general store searching.
  @Get('search')
  async searchStores(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<StoreEntity[]> {
    if (!query || query.trim().length < 2) {
      // Require a minimum query length
      throw new BadRequestException(
        'Search query must be at least 2 characters long.',
      );
    }
    const searchLimit = limit ? parseInt(limit, 10) : 10; // Default limit to 10
    if (isNaN(searchLimit) || searchLimit <= 0) {
      throw new BadRequestException('Invalid limit parameter.');
    }
    return this.storesService.searchStores(query.trim(), searchLimit);
  }

  // Endpoint to check slug validity / get basic store info by slug
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<StoreEntity> {
    const store = await this.storesService.findBySlug(slug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${slug}" not found.`);
    }
    // Return minimal info, or full entity depending on needs
    return store;
  }

  @Get('about')
  async getAboutContent(
    @Query('storeSlug') storeSlug: string,
  ): Promise<AboutContentEntity> {
    if (!storeSlug) {
      throw new BadRequestException('storeSlug query parameter is required.');
    }
    const aboutContent =
      await this.storesService.getAboutContentByStoreSlug(storeSlug);
    if (!aboutContent) {
      throw new NotFoundException(
        `About content for store slug "${storeSlug}" not found.`,
      );
    }
    return aboutContent;
  }

  @Get('testimonials')
  async getTestimonials(
    @Query('storeSlug') storeSlug: string,
  ): Promise<TestimonialEntity[]> {
    if (!storeSlug) {
      throw new BadRequestException('storeSlug query parameter is required.');
    }
    return this.storesService.getTestimonialsByStoreSlug(storeSlug);
  }
}
