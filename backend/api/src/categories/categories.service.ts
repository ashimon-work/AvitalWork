import { Injectable, Logger } from '@nestjs/common'; // Import Logger
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm'; // Import FindOptionsWhere, FindManyOptions
import { CategoryEntity } from './entities/category.entity';
// Remove Category interface import if not needed elsewhere in this file
// import { Category } from '@shared-types';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name); // Instantiate Logger
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(
    options?: FindManyOptions<CategoryEntity>,
  ): Promise<CategoryEntity[]> {
    return this.categoriesRepository.find(options);
  }

  async findAllForStoreBySlug(storeSlug: string): Promise<CategoryEntity[]> {
  const findOptions: FindManyOptions<CategoryEntity> = {
    where: { store: { slug: storeSlug } },
    relations: ['store'],
    order: { name: 'ASC' },
  };
  return this.categoriesRepository.find(findOptions);
}

  async getFeaturedCategories(storeSlug?: string): Promise<CategoryEntity[]> {
    // Add storeSlug parameter
    const where: FindOptionsWhere<CategoryEntity> = {};
    if (storeSlug) {
      where.store = { slug: storeSlug }; // Filter by store slug if provided
    }

    const findOptions: FindManyOptions<CategoryEntity> = {
      // Explicitly type findOptions
      where,
      take: 4,
      order: { name: 'ASC' }, // TypeORM should now infer 'ASC' correctly
      relations: ['store'],
    };
    this.logger.log(
      `Finding featured categories with options: ${JSON.stringify(findOptions)}`,
    );
    const categories = await this.categoriesRepository.find(findOptions);
    this.logger.log(`Found ${categories.length} featured categories.`);
    return categories;
  }

  async findOne(
    id: string,
    storeSlug?: string,
  ): Promise<CategoryEntity | null> {
    const where: FindOptionsWhere<CategoryEntity> = { id };
    if (storeSlug) {
      where.store = { slug: storeSlug };
    }

    // Use findOne with where and relations instead of findOneBy for relation filtering
    const category = await this.categoriesRepository.findOne({
      where,
      relations: ['store'], // Ensure store relation is loaded for filtering
    });
    return category;
  }
}
