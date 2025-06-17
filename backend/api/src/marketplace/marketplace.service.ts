import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { StoresService } from '../stores/stores.service';

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly storesService: StoresService,
  ) { }

  async getHomePageData() {
    const [featuredProductsResult, featuredCategories, featuredStores] = await Promise.all([
      this.productsService.findAll({ isFeaturedInMarketplace: true }),
      this.categoriesService.findAll({ where: { isFeaturedInMarketplace: true } }),
      this.storesService.findAll({ where: { isFeaturedInMarketplace: true } }),
    ]);

    // Ensure products have valid store data
    const productsWithValidStores = featuredProductsResult.products.map(product => ({
      ...product,
      store: product.store || null // Ensure store is never undefined
    }));

    return {
      featuredProducts: productsWithValidStores,
      featuredCategories,
      featuredStores,
    };
  }
}
