import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService, FindAllProductsParams } from './products.service';
import { ProductEntity } from './entities/product.entity';
import { ProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@UseGuards(StoreContextGuard)
@Controller('stores/:storeSlug/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private mapProductEntityToDto(product: ProductEntity): ProductDto {
    const productDto: ProductDto = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrls: product.imageUrls,
      store: product.store,
      categories: product.categories,
      tags: product.tags,
      stockLevel: product.stockLevel,
      isActive: product.isActive,
      isFeaturedInMarketplace: product.isFeaturedInMarketplace,
      options: product.options,
      variants: product.variants
        ? product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            options: variant.options,
            price: variant.price,
            stockLevel: variant.stockLevel,
            imageUrl: variant.imageUrl,
          }))
        : [],
    };
    return productDto;
  }

  @Get('featured')
  async getFeaturedProducts(
    @Req() req: AuthenticatedRequest,
  ): Promise<ProductDto[]> {
    const storeSlug: string = req.params.storeSlug; // storeSlug from path, validated by guard
    // No need for: if (!storeSlug) throw new BadRequestException('Store context is missing.');
    const products = await this.productsService.getFeaturedProducts(storeSlug);
    return products.map((product) => this.mapProductEntityToDto(product));
  }

  // Handle GET /stores/:storeSlug/products with query parameters
  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() queryParams: FindAllProductsParams,
  ): Promise<{ products: ProductDto[]; total: number }> {
    const storeSlug: string = req.params.storeSlug; // storeSlug from path
    // Add storeSlug to queryParams for service filtering, service expects it this way
    queryParams.storeSlug = storeSlug;
    const { products, total } = await this.productsService.findAll(queryParams);
    return {
      products: products.map((product) => this.mapProductEntityToDto(product)),
      total,
    };
  }

  @Get('suggest') // Handle GET /stores/:storeSlug/products/suggest
  async getSuggestions(
    @Req() req: AuthenticatedRequest,
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<ProductDto[]> {
    const storeSlug: string = req.params.storeSlug; // storeSlug from path
    if (!query) {
      return [];
    }
    const suggestionLimit = limit ? parseInt(limit, 10) : 5;
    const products = await this.productsService.getSearchSuggestions(
      query,
      storeSlug,
      suggestionLimit,
    );
    return products.map((product) => this.mapProductEntityToDto(product));
  }

  // Note: The ':id' for findOne will be relative to '/stores/:storeSlug/products/'
  // So the full path will be '/stores/:storeSlug/products/:id'
  @Get(':id')
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ProductDto | null> {
    const storeSlug: string = req.params.storeSlug; // storeSlug from path
    const product = await this.productsService.findOne(id, storeSlug);
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${id} not found in store ${storeSlug}`,
      );
    }
    return this.mapProductEntityToDto(product);
  }

  // Endpoint: GET /api/stores/:storeSlug/products/recommended
  @Get('recommended')
  async getRecommendedProducts(
    @Req() req: AuthenticatedRequest,
    @Query('based_on') orderId?: string,
  ): Promise<ProductDto[]> {
    const storeSlug: string = req.params.storeSlug;

    let recommendedProducts: ProductEntity[];

    if (orderId) {
      recommendedProducts = await this.productsService.findRecommendedByOrderId(
        orderId,
        storeSlug,
      );
    } else {
      recommendedProducts =
        await this.productsService.getFeaturedProducts(storeSlug);
    }

    return recommendedProducts.map((product) =>
      this.mapProductEntityToDto(product),
    );
  }

  @Get(':id/related') // Endpoint: GET /api/stores/:storeSlug/products/:id/related
  async getRelatedProductsController(
    @Param('id') productId: string,
    @Param('storeSlug') storeSlug: string, // storeSlug is already part of the path due to controller decorator
  ): Promise<ProductDto[]> {
    // Assuming a service method like findRelatedByProductId exists or will be created
    // The storeSlug from the path is passed to the service method for context.
    const relatedProducts = await this.productsService.findRelatedByProductId(
      productId,
      storeSlug,
    );
    if (!relatedProducts || relatedProducts.length === 0) {
      // It's common to return an empty array if no related products are found,
      // rather than a 404, unless the product itself doesn't exist (which findOne would handle).
      return [];
    }
    return relatedProducts.map((product) =>
      this.mapProductEntityToDto(product),
    );
  }
}
