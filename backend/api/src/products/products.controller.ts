import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common'; // Added Query
import { ProductsService, FindAllProductsParams } from './products.service'; // Import FindAllProductsParams type
import { ProductEntity } from './entities/product.entity'; // Import ProductEntity instead of Product interface

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('featured')
  async getFeaturedProducts(): Promise<ProductEntity[]> { // Return ProductEntity array
    return this.productsService.getFeaturedProducts();
  }

  // Handle GET /products with query parameters for filtering, sorting, pagination
  @Get()
  async findAll(@Query() queryParams: FindAllProductsParams): Promise<{ products: ProductEntity[], total: number }> { // Return ProductEntity array
    // queryParams will contain validated and transformed query parameters if using ValidationPipe
    // For now, we pass the raw query object to the service
    return this.productsService.findAll(queryParams);
  }

  @Get(':id') // Handle GET /products/:id
  async findOne(@Param('id') id: string): Promise<ProductEntity> { // Return ProductEntity
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product; // Service now returns ProductEntity or null, NotFoundException handles null case
  }
}
