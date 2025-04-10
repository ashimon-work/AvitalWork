import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common'; // Added Query
import { ProductsService, FindAllProductsParams } from './products.service'; // Import FindAllProductsParams type
import { ProductEntity } from './entities/product.entity'; // Import ProductEntity instead of Product interface

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('featured')
  async getFeaturedProducts(@Query('storeSlug') storeSlug?: string): Promise<ProductEntity[]> { // Accept storeSlug query param
    return this.productsService.getFeaturedProducts(storeSlug); // Pass storeSlug to service
  }

  // Handle GET /products with query parameters for filtering, sorting, pagination
  @Get()
  async findAll(@Query() queryParams: FindAllProductsParams): Promise<{ products: ProductEntity[], total: number }> {
    // The storeSlug will be part of queryParams if provided
    return this.productsService.findAll(queryParams);
  }

  // Define specific routes like 'suggest' BEFORE parameterized routes like ':id'
  @Get('suggest') // Handle GET /products/suggest
  async getSuggestions(
    @Query('q') query: string,
    @Query('storeSlug') storeSlug?: string,
    @Query('limit') limit?: string // Query params are strings
  ): Promise<ProductEntity[]> {
    if (!query) {
      return []; // Return empty if no query provided
    }
    const suggestionLimit = limit ? parseInt(limit, 10) : 5; // Default limit to 5
    return this.productsService.getSearchSuggestions(query, storeSlug, suggestionLimit);
  }

  @Get(':id') // Handle GET /products/:id
  async findOne(@Param('id') id: string, @Query('storeSlug') storeSlug?: string): Promise<ProductEntity> { // Accept storeSlug query param
    const product = await this.productsService.findOne(id, storeSlug); // Pass storeSlug to service
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product; // Service now returns ProductEntity or null, NotFoundException handles null case
  }
}
