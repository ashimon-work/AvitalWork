import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common';
import { ProductsService, FindAllProductsParams } from './products.service';
import { ProductEntity } from './entities/product.entity'; // Uncommented import
import { ProductDto } from './dto/product.dto'; // Import ProductDto

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  // Helper method to map ProductEntity to ProductDto
  private mapProductEntityToDto(product: ProductEntity): ProductDto {
    const productDto: ProductDto = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrls: product.imageUrls,
      categoryIds: product.categories ? product.categories.map(cat => cat.id) : [], // Map CategoryEntity[] to string[]
      tags: product.tags,
      stockLevel: product.stockLevel,
      isActive: product.isActive,
      options: product.options,
      variants: product.variants ? product.variants.map(variant => ({ // Map ProductVariantEntity[] to ProductVariantDto[]
        id: variant.id,
        sku: variant.sku,
        options: variant.options, // Assuming options are already in the correct format
        price: variant.price,
        stockLevel: variant.stockLevel,
        imageUrl: variant.imageUrl,
      })) : [],
      // Add timestamps if needed in DTO
      // createdAt: product.createdAt,
      // updatedAt: product.updatedAt,
    };
    return productDto;
  }

  @Get('featured')
  async getFeaturedProducts(@Query('storeSlug') storeSlug?: string): Promise<ProductDto[]> { // Corrected return type to DTO
    const products = await this.productsService.getFeaturedProducts(storeSlug);
    return products.map(product => this.mapProductEntityToDto(product)); // Map entities to DTOs
  }

  // Handle GET /products with query parameters for filtering, sorting, pagination
  @Get()
  async findAll(@Query() queryParams: FindAllProductsParams): Promise<{ products: ProductDto[], total: number }> { // Corrected return type to DTO
    // The storeSlug will be part of queryParams if provided
    const { products, total } = await this.productsService.findAll(queryParams);
    return {
      products: products.map(product => this.mapProductEntityToDto(product)), // Map entities to DTOs
      total,
    };
  }

  @Get('suggest') // Handle GET /products/suggest
  async getSuggestions(
    @Query('q') query: string,
    @Query('storeSlug') storeSlug?: string,
    @Query('limit') limit?: string // Query params are strings
  ): Promise<ProductDto[]> { // Corrected return type to DTO
    if (!query) {
      return []; // Return empty if no query provided
    }
    const suggestionLimit = limit ? parseInt(limit, 10) : 5; // Default limit to 5
    const products = await this.productsService.getSearchSuggestions(query, storeSlug, suggestionLimit);
    return products.map(product => this.mapProductEntityToDto(product)); // Map entities to DTOs
  }

  @Get(':id') // Handle GET /products/:id
  async findOne(@Param('id') id: string, @Query('storeSlug') storeSlug?: string): Promise<ProductDto | null> { // Corrected return type to DTO
    const product = await this.productsService.findOne(id, storeSlug); // Pass storeSlug to service
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.mapProductEntityToDto(product); // Map entity to DTO
  }
}
