import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '@shared-types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('featured')
  async getFeaturedProducts(): Promise<Product[]> {
    return this.productsService.getFeaturedProducts();
  }
}
