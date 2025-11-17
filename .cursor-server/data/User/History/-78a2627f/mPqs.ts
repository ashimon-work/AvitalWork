import { UseGuards, Req } from '@nestjs/common';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
  Logger,
} from '@nestjs/common'; // Added Query, Logger
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity'; // Import CategoryEntity instead of Category interface

@UseGuards(StoreContextGuard)
@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name); // Instantiate Logger
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findCategoriesByStoreSlug(
    @Req() req: AuthenticatedRequest,
  ): Promise<CategoryEntity[]> {
    const storeSlug: string = req.params.storeSlug;
    return this.categoriesService.findAllForStoreBySlug(storeSlug);
  }

  @Get('featured')
  async getFeaturedCategories(
    @Query('storeSlug') storeSlug?: string,
  ): Promise<CategoryEntity[]> {
    this.logger.log(
      `Received request for featured categories. Store Slug: ${storeSlug}`,
    );
    const categories =
      await this.categoriesService.getFeaturedCategories(storeSlug);
    this.logger.log(
      `Returning ${categories.length} featured categories for store: ${storeSlug}`,
    );
    return categories;
  }

  @Get(':id') // Handle GET /categories/:id
  async findOne(
    @Param('id') id: string,
    @Query('storeSlug') storeSlug?: string,
  ): Promise<CategoryEntity> {
    // Accept storeSlug query param
    const category = await this.categoriesService.findOne(id, storeSlug); // Pass storeSlug to service
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category; // Service now returns CategoryEntity or null, NotFoundException handles null case
  }
}
