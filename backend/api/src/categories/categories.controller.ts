import { Controller, Get, Param, NotFoundException } from '@nestjs/common'; // Added Param, NotFoundException
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity'; // Import CategoryEntity instead of Category interface

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('featured')
  async getFeaturedCategories(): Promise<CategoryEntity[]> { // Return CategoryEntity array
    return this.categoriesService.getFeaturedCategories();
  }

  @Get(':id') // Handle GET /categories/:id
  async findOne(@Param('id') id: string): Promise<CategoryEntity> { // Return CategoryEntity
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category; // Service now returns CategoryEntity or null, NotFoundException handles null case
  }
}
