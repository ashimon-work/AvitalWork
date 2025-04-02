import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm'; // Import FindOptionsWhere
import { CategoryEntity } from './entities/category.entity';
// Remove Category interface import if not needed elsewhere in this file
// import { Category } from '@shared-types';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async getFeaturedCategories(storeSlug?: string): Promise<CategoryEntity[]> { // Add storeSlug parameter
    const where: FindOptionsWhere<CategoryEntity> = {};
    if (storeSlug) {
      where.store = { slug: storeSlug }; // Filter by store slug if provided
    }

    return this.categoriesRepository.find({
      where,
      take: 4,
      order: { name: 'ASC' }, // Example ordering
      relations: ['store'], // Ensure store relation is loaded for filtering
    });
  }

  async findOne(id: string, storeSlug?: string): Promise<CategoryEntity | null> { // Add storeSlug parameter
    const where: FindOptionsWhere<CategoryEntity> = { id };
    if (storeSlug) {
      where.store = { slug: storeSlug }; // Filter by store slug if provided
    }

    // Use findOne with where and relations instead of findOneBy for relation filtering
    const category = await this.categoriesRepository.findOne({
      where,
      relations: ['store'], // Ensure store relation is loaded for filtering
    });
    return category;
  }
}
