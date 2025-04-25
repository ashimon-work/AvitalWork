import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, MoreThanOrEqual, LessThanOrEqual, In, FindOptionsOrder, Between } from 'typeorm';
// import { Product } from '@shared-types'; // No longer directly using shared interface for entity return
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from '../categories/entities/category.entity'; // Import CategoryEntity

// Define interface for query parameters used in findAll
export interface FindAllProductsParams {
  category_id?: string;
  sort?: string; // e.g., 'price-asc', 'price-desc', 'newest'
  page?: number;
  limit?: number;
  price_min?: number;
  price_max?: number;
  tags?: string;
  q?: string;
  storeSlug?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  async getFeaturedProducts(storeSlug?: string): Promise<ProductEntity[]> { // Add storeSlug parameter
    // Fetch products tagged as 'Featured'
    // Note: Using array_contains or similar depends on DB. This uses basic find.
    // A better approach might be a dedicated 'isFeatured' flag or relation.
    const where: FindOptionsWhere<ProductEntity> = {
      tags: ILike('%Featured%'),
      isActive: true,
    };

    if (storeSlug) {
      where.store = { slug: storeSlug };
    }

    return this.productsRepository.find({
      where,
      take: 8,
      relations: ['store', 'categories', 'variants'], // Load categories and variants
    });
  }

  async findOne(id: string, storeSlug?: string): Promise<ProductEntity | null> {
    const where: FindOptionsWhere<ProductEntity> = {
      id: id, // Use the primary 'id' field for lookup
      isActive: true,
    };

    if (storeSlug) {
      where.store = { slug: storeSlug };
    }

    const product = await this.productsRepository.findOne({
      where,
      relations: ['store', 'categories', 'variants'], // Load categories and variants for detailed view
    });

    return product;
  }

  async findAll(params: FindAllProductsParams): Promise<{ products: ProductEntity[], total: number }> {
    const page = params.page ? +params.page : 1;
    const limit = params.limit ? +params.limit : 12;
    const skip = (page - 1) * limit;

    // Build WHERE conditions
    const where: FindOptionsWhere<ProductEntity> = { isActive: true };

    // Add store filtering
    if (params.storeSlug) {
      where.store = { slug: params.storeSlug };
    }
    if (params.q) {
      // Basic search on name and description
      where.name = ILike(`%${params.q}%`); // Case-insensitive search
      // Add description search if needed, might need OR condition which is more complex
      // where.description = ILike(`%${params.q}%`);
    }
    // Handle price range filtering correctly
    if (params.price_min !== undefined && params.price_max !== undefined) {
      where.price = Between(params.price_min, params.price_max);
    } else if (params.price_min !== undefined) {
      where.price = MoreThanOrEqual(params.price_min);
    } else if (params.price_max !== undefined) {
      where.price = LessThanOrEqual(params.price_max);
    }
    if (params.tags) {
      // Filtering by tags in simple-array might require specific DB functions or fetching then filtering
      // where.tags = In(params.tags.split(',')); // This might not work directly
      // For now, we might have to fetch more and filter in code, or omit tag filtering here
    }
    // Category filtering using the ManyToMany relation
    if (params.category_id) {
      // This requires joining the categories table
      // TypeORM allows filtering on relations directly in where clause
      where.categories = { id: params.category_id } as FindOptionsWhere<CategoryEntity>;
    }


    // Build ORDER conditions
    const order: FindOptionsOrder<ProductEntity> = {};
    switch (params.sort) {
      case 'price-asc':
        order.price = 'ASC';
        break;
      case 'price-desc':
        order.price = 'DESC';
        break;
      case 'name-asc':
         order.name = 'ASC';
         break;
      case 'newest': // Assuming 'createdAt' field exists
         order.createdAt = 'DESC';
         break;
      default:
         order.name = 'ASC'; // Default sort
         break;
    }

    const [results, total] = await this.productsRepository.findAndCount({
      where,
      order,
      take: limit,
      skip: skip,
      relations: ['store'], // Load store relation for filtering
      // relations: ['store', 'categories'], // Include categories later if needed
    });

    // TODO: Re-apply tag filtering here if DB query wasn't possible
    // if (params.tags) { ... filter results array ... }

    return { products: results, total };
  }

  async getSearchSuggestions(query: string, storeSlug?: string, limit: number = 5): Promise<ProductEntity[]> {
    const where: FindOptionsWhere<ProductEntity> = {
      name: ILike(`%${query}%`), // Case-insensitive partial match on name
      isActive: true,
    };

    if (storeSlug) {
      where.store = { slug: storeSlug };
    }

    return this.productsRepository.find({
      where,
      take: limit,
      select: ['id', 'name', 'imageUrls', 'price'], // Also select imageUrls and price for display
      relations: ['store'], // Needed for store slug filtering
      order: { name: 'ASC' } // Optional: order suggestions
    });
  }
}
