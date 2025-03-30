import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '@shared-types';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('featured')
  async getFeaturedCategories(): Promise<Category[]> {
    return this.categoriesService.getFeaturedCategories();
  }
}
