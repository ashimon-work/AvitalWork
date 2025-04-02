import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common'; // Added Query
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity'; // Import CategoryEntity instead of Category interface

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('featured')
  async getFeaturedCategories(@Query('storeSlug') storeSlug?: string): Promise<CategoryEntity[]> { // Accept storeSlug query param
    return this.categoriesService.getFeaturedCategories(storeSlug); // Pass storeSlug to service
  }

  @Get(':id') // Handle GET /categories/:id
  async findOne(@Param('id') id: string, @Query('storeSlug') storeSlug?: string): Promise<CategoryEntity> { // Accept storeSlug query param
    const category = await this.categoriesService.findOne(id, storeSlug); // Pass storeSlug to service
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category; // Service now returns CategoryEntity or null, NotFoundException handles null case
  }
}
