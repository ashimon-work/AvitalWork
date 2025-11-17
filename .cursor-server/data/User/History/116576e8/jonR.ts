import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(
    options?: FindManyOptions<CategoryEntity>,
  ): Promise<CategoryEntity[]> {
    return this.categoriesRepository.find(options);
  }

  async findAllCategorysForStoreBySlug(storeSlug: string): Promise<CategoryEntity[]> {
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
      where.store = { slug: storeSlug };
    }

    const findOptions: FindManyOptions<CategoryEntity> = {
      where,
      take: 4,
      order: { name: 'ASC' },
      relations: ['store'],
    };
    const categories = await this.categoriesRepository.find(findOptions);
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
      relations: ['store'],
    });
    return category;
  }
}
