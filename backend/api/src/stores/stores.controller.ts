import { Controller, Get, Query, BadRequestException, Param, NotFoundException } from '@nestjs/common'; // Import Param, NotFoundException
import { StoresService } from './stores.service';
import { StoreEntity } from './entities/store.entity';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get('search')
  async searchStores(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<StoreEntity[]> {
    if (!query || query.trim().length < 2) { // Require a minimum query length
      throw new BadRequestException('Search query must be at least 2 characters long.');
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

  // Add other store endpoints if needed later
}