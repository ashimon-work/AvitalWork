import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { StoreEntity } from '../stores/entities/store.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
  ) {}

  async getHomePageData() {
    const featuredProducts = await this.productRepository.find({
      where: { isFeaturedInMarketplace: true },
      relations: ['store', 'categories'],
    });
    const featuredCategories = await this.categoryRepository.find({
      where: { isFeaturedInMarketplace: true },
      relations: ['store'],
    });
    const featuredStores = await this.storeRepository.find({
      where: { isFeaturedInMarketplace: true },
    });

    return {
      featuredProducts,
      featuredCategories,
      featuredStores,
    };
  }

  async getStorePageData(slug: string) {
    const store = await this.storeRepository.findOne({ where: { slug } });
    if (!store) {
      return null;
    }

    const featuredProducts = await this.productRepository.find({
      where: { store: { id: store.id }, isFeaturedInMarketplace: true },
      relations: ['store', 'categories'],
    });

    const products = await this.productRepository.find({
      where: { store: { id: store.id } },
      relations: ['store', 'categories'],
    });

    return {
      store,
      featuredProducts,
      products,
    };
  }
}
