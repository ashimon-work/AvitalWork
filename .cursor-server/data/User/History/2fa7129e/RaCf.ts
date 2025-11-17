import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  ILike,
  MoreThan,
  MoreThanOrEqual,
  LessThanOrEqual,
  In,
  FindOptionsOrder,
  Between,
  Not,
} from 'typeorm';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImportProductItemDto } from './dto/import-product-item.dto';
import { parse } from 'csv-parse/sync';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export interface FindAllProductsParams {
  category_id?: string;
  sort?: string;
  page?: number;
  limit?: number;
  price_min?: number;
  price_max?: number;
  stockLevel?: number;
  tags?: string;
  q?: string;
  storeSlug?: string;
  isFeaturedInMarketplace?: boolean;
  inStockOnly?: boolean;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly logger: Logger,
  ) {}

  async decreaseStock(
    transactionManager: import('typeorm').EntityManager,
    productId: string,
    variantId: string | null | undefined,
    quantity: number,
    storeId: string, // Added storeId for context, though product/variant should be unique
  ): Promise<void> {
    this.logger.log(
      `Attempting to decrease stock for product ${productId}, variant ${variantId}, quantity ${quantity}`,
    );

    if (variantId) {
      const variant = await transactionManager.findOne(ProductVariantEntity, {
        where: { id: variantId, productId: productId },
        // relations: ['product'], // Ensure product relation if needed for store check, but productId should suffice
      });

      if (!variant) {
        this.logger.error(
          `Variant with ID "${variantId}" for product "${productId}" not found.`,
        );
        throw new NotFoundException(
          `Variant with ID "${variantId}" for product "${productId}" not found.`,
        );
      }
      // Optional: Check if variant.product.storeId === storeId if variant.product is loaded

      if (variant.stockLevel < quantity) {
        this.logger.warn(
          `Insufficient stock for variant ${variantId}. Available: ${variant.stockLevel}, Requested: ${quantity}`,
        );
        throw new Error(
          `Insufficient stock for variant ${variant.sku || variantId}. Available: ${variant.stockLevel}, Requested: ${quantity}`,
        );
      }
      variant.stockLevel -= quantity;
      await transactionManager.save(variant);
      this.logger.log(
        `Stock for variant ${variantId} updated to ${variant.stockLevel}`,
      );
    } else {
      const product = await transactionManager.findOne(ProductEntity, {
        where: { id: productId, store: { id: storeId } },
      });

      if (!product) {
        this.logger.error(
          `Product with ID "${productId}" not found in store "${storeId}".`,
        );
        throw new NotFoundException(
          `Product with ID "${productId}" not found.`,
        );
      }

      if (product.stockLevel < quantity) {
        this.logger.warn(
          `Insufficient stock for product ${productId}. Available: ${product.stockLevel}, Requested: ${quantity}`,
        );
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stockLevel}, Requested: ${quantity}`,
        );
      }
      product.stockLevel -= quantity;
      await transactionManager.save(product);
      this.logger.log(
        `Stock for product ${productId} updated to ${product.stockLevel}`,
      );
    }
  }

  async createForManager(
    storeSlug: string,
    createProductDto: CreateProductDto,
  ): Promise<ProductEntity> {
    const store = await this.storeRepository.findOne({
      where: { slug: storeSlug },
    });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const categories = await this.categoryRepository.findBy({
      id: In(createProductDto.categoryIds),
    });

    const newProduct = this.productsRepository.create({
      ...createProductDto,
      store: store,
      categories: categories,
      // Handle variants and options if needed, potentially creating new entities
    });

    return this.productsRepository.save(newProduct);
  }

  async getFeaturedProducts(storeSlug?: string): Promise<ProductEntity[]> {
    const where: FindOptionsWhere<ProductEntity> = {
      isActive: true,
      // Use isFeaturedInMarketplace if available, otherwise show all active products
      // For storefront, we'll show all active products as "featured" for now
      // If you want to filter by isFeaturedInMarketplace, uncomment the line below:
      // isFeaturedInMarketplace: true,
    };

    if (storeSlug) {
      where.store = { slug: storeSlug };
    }

    return this.productsRepository.find({
      where,
      take: 20, // Increased limit to show more products
      relations: ['store', 'categories', 'variants'],
      order: {
        createdAt: 'DESC', // Show newest products first
      },
    });
  }

  async findOne(id: string, storeSlug?: string): Promise<ProductEntity | null> {
    const where: FindOptionsWhere<ProductEntity> = {
      id: id,
      isActive: true,
    };

    if (storeSlug) {
      where.store = { slug: storeSlug };
    }

    const product = await this.productsRepository.findOne({
      where,
      relations: ['store', 'categories', 'variants'],
    });

    return product;
  }
  async findOneForManager(
    storeSlug: string,
    id: string,
  ): Promise<ProductEntity> {
    const product = await this.productsRepository.findOne({
      where: {
        id: id,
        store: { slug: storeSlug },
      },
      relations: ['store', 'categories', 'variants'], // Eager load necessary relations
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID "${id}" not found for store "${storeSlug}".`,
      );
    }

    return product;
  }

  async findAll(
    params: FindAllProductsParams,
  ): Promise<{ products: ProductEntity[]; total: number }> {
    const page = params.page ? +params.page : 1;
    const limit = params.limit ? +params.limit : 12;
    const skip = (page - 1) * limit;

    // If category_id is provided, use query builder for ManyToMany relation filtering
    if (params.category_id) {
      this.logger.log(
        `[ProductsService] Filtering products by category_id: ${params.category_id}, storeSlug: ${params.storeSlug}`,
      );
      const queryBuilder = this.productsRepository
        .createQueryBuilder('product')
        .innerJoinAndSelect('product.categories', 'categories', 'categories.id = :categoryId', {
          categoryId: params.category_id,
        })
        .leftJoinAndSelect('product.store', 'store')
        .where('product.isActive = :isActive', { isActive: true });

      if (params.storeSlug) {
        queryBuilder.andWhere('store.slug = :storeSlug', { storeSlug: params.storeSlug });
      }

      if (params.isFeaturedInMarketplace) {
        queryBuilder.andWhere('product.isFeaturedInMarketplace = :isFeatured', {
          isFeatured: true,
        });
      }

      if (params.q) {
        queryBuilder.andWhere('product.name ILIKE :search', {
          search: `%${params.q}%`,
        });
      }

      if (params.inStockOnly) {
        queryBuilder.andWhere('product.stockLevel > :stockLevel', { stockLevel: 0 });
      }

      if (params.price_min !== undefined && params.price_max !== undefined) {
        queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
          minPrice: params.price_min,
          maxPrice: params.price_max,
        });
      } else if (params.price_min !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', {
          minPrice: params.price_min,
        });
      } else if (params.price_max !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', {
          maxPrice: params.price_max,
        });
      }

      // Apply sorting
      switch (params.sort) {
        case 'price-asc':
          queryBuilder.orderBy('product.price', 'ASC');
          break;
        case 'price-desc':
          queryBuilder.orderBy('product.price', 'DESC');
          break;
        case 'name-asc':
          queryBuilder.orderBy('product.name', 'ASC');
          break;
        case 'newest':
          queryBuilder.orderBy('product.createdAt', 'DESC');
          break;
        default:
          queryBuilder.orderBy('product.name', 'ASC');
          break;
      }

      // Apply pagination
      queryBuilder.take(limit).skip(skip);

      const [results, total] = await queryBuilder.getManyAndCount();
      return { products: results, total };
    }

    // For non-category filtering, use the simpler find approach
    const where: FindOptionsWhere<ProductEntity> = { isActive: true };

    if (params.isFeaturedInMarketplace) {
      where.isFeaturedInMarketplace = true;
    }

    if (params.storeSlug) {
      where.store = { slug: params.storeSlug };
    }
    if (params.q) {
      where.name = ILike(`%${params.q}%`);
    }
    if (params.inStockOnly) {
      where.stockLevel = MoreThan(0);
    }
    if (params.price_min !== undefined && params.price_max !== undefined) {
      where.price = Between(params.price_min, params.price_max);
    } else if (params.price_min !== undefined) {
      where.price = MoreThanOrEqual(params.price_min);
    } else if (params.price_max !== undefined) {
      where.price = LessThanOrEqual(params.price_max);
    }
    if (params.tags) {
    }

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
      case 'newest':
        order.createdAt = 'DESC';
        break;
      default:
        order.name = 'ASC';
        break;
    }

    const [results, total] = await this.productsRepository.findAndCount({
      where,
      order,
      take: limit,
      skip: skip,
      relations: ['store', 'categories'],
    });

    return { products: results, total };
  }

  async getSearchSuggestions(
    query: string,
    storeSlug?: string,
    limit: number = 5,
  ): Promise<ProductEntity[]> {
    const where: FindOptionsWhere<ProductEntity> = {
      name: ILike(`%${query}%`),
      isActive: true,
    };

    if (storeSlug) {
      where.store = { slug: storeSlug };
    }

    return this.productsRepository.find({
      where,
      take: limit,
      select: ['id', 'name', 'imageUrls', 'price'],
      relations: ['store'],
      order: { name: 'ASC' },
    });
  }

  async findRecommendedByOrderId(
    orderId: string,
    storeSlug: string,
  ): Promise<ProductEntity[]> {
    this.logger.log(
      `Fetching recommended products for order ${orderId} in store ${storeSlug}`,
    );
    return this.getFeaturedProducts(storeSlug);
  }

  async updateForManager(
    storeSlug: string,
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    const product = await this.productsRepository.findOne({
      where: {
        id: id,
        store: { slug: storeSlug },
      },
      relations: ['store', 'categories', 'variants'], // Eager load necessary relations
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID "${id}" not found for store "${storeSlug}".`,
      );
    }

    // Apply partial updates from DTO
    // Note: This simple approach works for basic fields.
    // Updating relations (categories, variants, images) requires more complex logic
    // depending on how the DTO represents those updates (e.g., full replacement, add/remove).
    // For this task, we'll focus on basic field updates.
    Object.assign(product, updateProductDto);

    // If categories are updated in the DTO, fetch and update the relation
    if (updateProductDto.categoryIds) {
      const categories = await this.categoryRepository.findBy({
        id: In(updateProductDto.categoryIds),
      });
      product.categories = categories;
    }

    // TODO: Implement logic for updating variants and images if needed based on DTO structure

    return this.productsRepository.save(product);
  }

  async deleteForManager(storeSlug: string, id: string): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: {
        id: id,
        store: { slug: storeSlug },
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID "${id}" not found for store "${storeSlug}".`,
      );
    }

    await this.productsRepository.delete(id);
  }

  async bulkDeleteForManager(
    storeSlug: string,
    productIds: string[],
  ): Promise<{ deletedCount: number }> {
    // Verify that all product IDs exist and belong to the store
    const productsToDelete = await this.productsRepository.find({
      where: {
        id: In(productIds),
        store: { slug: storeSlug },
      },
    });

    if (productsToDelete.length !== productIds.length) {
      const foundProductIds = productsToDelete.map((p) => p.id);
      const notFoundIds = productIds.filter(
        (id) => !foundProductIds.includes(id),
      );
      throw new NotFoundException(
        `Products with IDs "${notFoundIds.join(', ')}" not found or do not belong to store "${storeSlug}".`,
      );
    }

    // Perform bulk deletion
    const deleteResult = await this.productsRepository.delete(productIds);

    return { deletedCount: deleteResult.affected || 0 };
  }

  async bulkUpdateStatusForManager(
    storeSlug: string,
    productIds: string[],
    status: string,
  ): Promise<{ updatedCount: number }> {
    // Verify that all product IDs exist and belong to the store
    const productsToUpdate = await this.productsRepository.find({
      where: {
        id: In(productIds),
        store: { slug: storeSlug },
      },
    });

    if (productsToUpdate.length !== productIds.length) {
      const foundProductIds = productsToUpdate.map((p) => p.id);
      const notFoundIds = productIds.filter(
        (id) => !foundProductIds.includes(id),
      );
      throw new NotFoundException(
        `Products with IDs "${notFoundIds.join(', ')}" not found or do not belong to store "${storeSlug}".`,
      );
    }

    // Perform bulk update
    const updateResult = await this.productsRepository.update(productIds, {
      isActive: status === 'active',
    });

    return { updatedCount: updateResult.affected || 0 };
  }

  async exportForManager(storeSlug: string): Promise<string> {
    const products = await this.productsRepository.find({
      where: {
        store: { slug: storeSlug },
      },
      relations: ['categories'], // Load categories to include their names
    });

    if (!products || products.length === 0) {
      return 'No products found for this store.';
    }

    // Define CSV headers
    const headers = [
      'ID',
      'Name',
      'SKU',
      'Price',
      'Stock',
      'Status',
      'Tags',
      'Categories',
    ];
    let csvContent = headers.join(',') + '\n';

    // Format product data into CSV rows
    products.forEach((product) => {
      const status = product.isActive ? 'Active' : 'Inactive';
      const categoryNames = product.categories.map((cat) => cat.name).join(';'); // Join multiple categories with a semicolon
      const row = [
        product.id,
        `"${product.name.replace(/"/g, '""')}"`, // Handle quotes in names
        product.sku,
        product.price,
        product.stockLevel,
        status,
        `"${product.tags ? product.tags.join(';').replace(/"/g, '""') : ''}"`, // Handle tags array and quotes
        `"${categoryNames.replace(/"/g, '""')}"`, // Handle quotes in category names
      ].join(',');
      csvContent += row + '\n';
    });

    return csvContent;
  }

  async importForManager(
    storeSlug: string,
    file: Express.Multer.File,
  ): Promise<{
    created: number;
    updated: number;
    failed: number;
    errors: any[];
  }> {
    const store = await this.storeRepository.findOne({
      where: { slug: storeSlug },
    });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const productsToImport: ImportProductItemDto[] = [];
    const errors: any[] = [];
    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    try {
      // Assuming CSV file for now
      const fileContent = file.buffer.toString();
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      for (const record of records) {
        const productItemDto = plainToClass(ImportProductItemDto, record);
        const validationErrors = await validate(productItemDto);

        if (validationErrors.length > 0) {
          failedCount++;
          errors.push({ sku: record.sku || 'N/A', errors: validationErrors });
          continue;
        }
        productsToImport.push(productItemDto);
      }

      for (const item of productsToImport) {
        try {
          const product = await this.productsRepository.findOne({
            where: { sku: item.sku, store: { slug: storeSlug } },
          });

          const categories = item.categoryIds
            ? await this.categoryRepository.findBy({
                id: In(item.categoryIds.split(',').map((id) => id.trim())),
              })
            : [];

          if (product) {
            // Update existing product
            product.name = item.name;
            product.description = item.description;
            product.price = parseFloat(item.price);
            if (item.imageUrls !== undefined) {
              product.imageUrls = item.imageUrls
                ? item.imageUrls.split(',').map((url) => url.trim())
                : [];
            }
            if (item.tags !== undefined) {
              product.tags = item.tags
                ? item.tags.split(',').map((tag) => tag.trim())
                : [];
            }
            product.stockLevel = parseInt(item.stockLevel, 10);
            if (item.isActive !== undefined) {
              product.isActive = item.isActive.toLowerCase() === 'true';
            }
            if (categories.length > 0) {
              product.categories = categories;
            }
            // TODO: Handle options and variants parsing and updating

            await this.productsRepository.save(product);
            updatedCount++;
          } else {
            // Create new product
            const newProduct = this.productsRepository.create({
              sku: item.sku,
              name: item.name,
              description: item.description,
              price: parseFloat(item.price),
              imageUrls: item.imageUrls
                ? item.imageUrls.split(',').map((url) => url.trim())
                : [],
              tags: item.tags
                ? item.tags.split(',').map((tag) => tag.trim())
                : [],
              stockLevel: parseInt(item.stockLevel, 10),
              isActive:
                item.isActive !== undefined
                  ? item.isActive.toLowerCase() === 'true'
                  : true,
              store: store,
              categories: categories,
              // TODO: Handle options and variants creation
            });
            await this.productsRepository.save(newProduct);
            createdCount++;
          }
        } catch (itemError) {
          failedCount++;
          errors.push({ sku: item.sku, error: itemError.message });
          this.logger.error(
            `Failed to import product with SKU ${item.sku} for store ${storeSlug}: ${itemError.message}`,
            itemError.stack,
          );
        }
      }
    } catch (parseError) {
      failedCount = productsToImport.length; // Mark all as failed if parsing fails
      errors.push({ error: `File parsing failed: ${parseError.message}` });
      this.logger.error(
        `Failed to parse import file for store ${storeSlug}: ${parseError.message}`,
        parseError.stack,
      );
    }

    return {
      created: createdCount,
      updated: updatedCount,
      failed: failedCount,
      errors,
    };
  }

  async findRelatedByProductId(
    productId: string,
    storeSlug: string,
  ): Promise<ProductEntity[]> {
    this.logger.log(
      `Finding related products for productId: ${productId} in store: ${storeSlug}`,
    );
    // Placeholder implementation:
    // Actual logic could involve finding products in the same category, with similar tags,
    // or based on collaborative filtering, etc.
    // For now, let's return a few other products from the same store, excluding the product itself.
    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      this.logger.warn(
        `Store with slug ${storeSlug} not found when finding related products.`,
      );
      return [];
    }

    const products = await this.productsRepository.find({
      where: {
        store: { id: store.id },
        isActive: true,
        id: Not(productId),
      },
      take: 5, // Limit to 5 related products
      relations: ['store', 'categories', 'variants'],
    });
    // Filter out the original product if it was somehow included
    return products.filter((p) => p.id !== productId);
  }
}
