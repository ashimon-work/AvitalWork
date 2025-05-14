import { Controller, Get, Param, NotFoundException, Query, UseGuards, Req, BadRequestException } from '@nestjs/common'; // Added UseGuards, Req, BadRequestException
import { ProductsService, FindAllProductsParams } from './products.service';
import { ProductEntity } from './entities/product.entity'; // Uncommented import
import { ProductDto } from './dto/product.dto'; // Import ProductDto
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import JwtAuthGuard
import { StoreContextGuard } from '../core/guards/store-context.guard'; // Import StoreContextGuard
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface'; // Import AuthenticatedRequest

@UseGuards(JwtAuthGuard, StoreContextGuard) // Protect all routes in this controller
@Controller('products') // Base path for storefront products endpoints
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
  async getFeaturedProducts(@Req() req: AuthenticatedRequest): Promise<ProductDto[]> { // Use AuthenticatedRequest to get storeSlug
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
      throw new BadRequestException('Store context is missing.');
    }
    const products = await this.productsService.getFeaturedProducts(storeSlug);
    return products.map(product => this.mapProductEntityToDto(product)); // Map entities to DTOs
  }

  // Handle GET /products with query parameters for filtering, sorting, pagination
  @Get()
  async findAll(@Req() req: AuthenticatedRequest, @Query() queryParams: FindAllProductsParams): Promise<{ products: ProductDto[], total: number }> { // Use AuthenticatedRequest and Query
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
      throw new BadRequestException('Store context is missing.');
    }
    // Add storeSlug to queryParams for service filtering
    queryParams.storeSlug = storeSlug;
    const { products, total } = await this.productsService.findAll(queryParams);
    return {
      products: products.map(product => this.mapProductEntityToDto(product)), // Map entities to DTOs
      total,
    };
  }

  @Get('suggest') // Handle GET /products/suggest
  async getSuggestions(
    @Req() req: AuthenticatedRequest, // Use AuthenticatedRequest
    @Query('q') query: string,
    @Query('limit') limit?: string // Query params are strings
  ): Promise<ProductDto[]> { // Corrected return type to DTO
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
      throw new BadRequestException('Store context is missing.');
    }
    if (!query) {
      return []; // Return empty if no query provided
    }
    const suggestionLimit = limit ? parseInt(limit, 10) : 5; // Default limit to 5
    const products = await this.productsService.getSearchSuggestions(query, storeSlug, suggestionLimit);
    return products.map(product => this.mapProductEntityToDto(product)); // Map entities to DTOs
  }

  @Get(':id') // Handle GET /products/:id
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<ProductDto | null> { // Use AuthenticatedRequest and Param
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
      throw new BadRequestException('Store context is missing.');
    }
    const product = await this.productsService.findOne(id, storeSlug); // Pass storeSlug to service
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.mapProductEntityToDto(product); // Map entity to DTO
  }

  @Get('recommended') // Endpoint: GET /api/products/recommended
  async getRecommendedProducts(
    @Req() req: AuthenticatedRequest,
    @Query('based_on') orderId?: string,
  ): Promise<ProductDto[]> {
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
      throw new BadRequestException('Store context is missing.');
    }

    let recommendedProducts: ProductEntity[];

    if (orderId) {
      // Get recommendations based on order ID
      recommendedProducts = await this.productsService.findRecommendedByOrderId(orderId, storeSlug);
    } else {
      // Get general recommendations (e.g., featured products)
      recommendedProducts = await this.productsService.getFeaturedProducts(storeSlug);
    }

    return recommendedProducts.map(product => this.mapProductEntityToDto(product)); // Map entities to DTOs
  }
}
