import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
// Remove Category interface import if not needed elsewhere in this file
// import { Category } from '@shared-types';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async getFeaturedCategories(): Promise<CategoryEntity[]> {
    // Fetch first 4 categories as "featured" for now
    // Add specific criteria later (e.g., isFeatured flag)
    return this.categoriesRepository.find({
      take: 4,
      order: { name: 'ASC' } // Example ordering
    });
  }

  async findOne(id: string): Promise<CategoryEntity | null> {
    // Fetch from database using TypeORM repository
    const category = await this.categoriesRepository.findOneBy({ id });
    // Note: findOneBy returns null if not found, controller handles NotFoundException
    return category;
  }
}
