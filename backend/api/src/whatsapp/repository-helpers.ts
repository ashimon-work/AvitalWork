import { ObjectLiteral, Repository } from 'typeorm';
import { CategoryEntity } from '../categories/entities/category.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ProductVariantEntity } from 'src/products/entities/product-variant.entity';

/**
 * Stateless repository operation helpers
 */

/**
 * Generic function to find entity by ID with error handling
 */
export const findEntityById = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  id: string,
  relations?: string[],
): Promise<T | null> => {
  try {
    return await repository.findOne({
      where: { id } as any,
      relations,
    });
  } catch (error) {
    console.error(`Error finding entity with id ${id}:`, error);
    return null;
  }
};

/**
 * Generic function to find entities with pagination
 */
export const findEntitiesWithPagination = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  where: any,
  page: number = 1,
  limit: number = 10,
  relations?: string[],
): Promise<{ items: T[]; total: number; page: number; totalPages: number }> => {
  const [items, total] = await repository.findAndCount({
    where,
    relations,
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Product-specific repository helpers
 */

export interface ProductCreationData {
  name: string;
  description: string;
  price: number;
  imageUrls?: string[];
  categoryId: string;
  storeId: string;
  sku?: string;
}

export interface VariantCreationData {
  sku: string;
  price: number;
  stockLevel: number;
  options: Array<{ name: string; value: string }>;
}

/**
 * Stateless function to prepare product data for creation
 */
export const prepareProductData = (
  data: ProductCreationData,
): Partial<ProductEntity> => ({
  name: data.name,
  description: data.description,
  price: data.price,
  imageUrls: data.imageUrls || [],
  storeId: data.storeId,
  sku: data.sku || `SKU-${Date.now()}`,
  stockLevel: 0,
  isActive: true,
});

/**
 * Stateless function to calculate total stock from variants
 */
export const calculateTotalStock = (
  variants: ProductVariantEntity[],
): number => {
  return variants.reduce((total, variant) => total + variant.stockLevel, 0);
};

/**
 * Create product with variants as a single transaction
 */
export const createProductWithVariants = async (
  productRepository: Repository<ProductEntity>,
  variantRepository: Repository<ProductVariantEntity>,
  categoryRepository: Repository<CategoryEntity>,
  productData: ProductCreationData,
  variantsData: VariantCreationData[],
): Promise<ProductEntity> => {
  const product = productRepository.create(prepareProductData(productData));

  // Set category
  const category = await findEntityById(
    categoryRepository,
    productData.categoryId,
  );
  if (category) {
    product.categories = [category];
  }

  // Save product
  const savedProduct = await productRepository.save(product);

  // Create variants
  let totalStock = 0;
  for (const variantData of variantsData) {
    const variant = variantRepository.create({
      ...variantData,
      product: savedProduct,
    });
    await variantRepository.save(variant);
    totalStock += variant.stockLevel;
  }

  // Update total stock
  savedProduct.stockLevel = totalStock;
  return await productRepository.save(savedProduct);
};

/**
 * Update product with new variants (replaces existing)
 */
export const updateProductWithVariants = async (
  productRepository: Repository<ProductEntity>,
  variantRepository: Repository<ProductVariantEntity>,
  productId: string,
  updates: Partial<ProductEntity>,
  newVariantsData?: VariantCreationData[],
): Promise<ProductEntity | null> => {
  const product = await findEntityById(productRepository, productId, [
    'variants',
  ]);
  if (!product) return null;

  // Update product fields
  Object.assign(product, updates);

  // Replace variants if provided
  if (newVariantsData) {
    // Delete existing variants
    await variantRepository.delete({ product: { id: productId } });

    // Create new variants
    let totalStock = 0;
    for (const variantData of newVariantsData) {
      const variant = variantRepository.create({
        ...variantData,
        product,
      });
      await variantRepository.save(variant);
      totalStock += variant.stockLevel;
    }
    product.stockLevel = totalStock;
  }

  return await productRepository.save(product);
};

/**
 * Category-specific repository helpers
 */

/**
 * Check if category name exists for a store
 */
export const categoryNameExists = async (
  categoryRepository: Repository<CategoryEntity>,
  name: string,
  storeId: string,
): Promise<boolean> => {
  const count = await categoryRepository.count({
    where: { name, storeId },
  });
  return count > 0;
};

/**
 * Get products by category with optional filters
 */
export const getProductsByCategory = async (
  productRepository: Repository<ProductEntity>,
  categoryId: string,
  filters?: {
    isActive?: boolean;
    minStock?: number;
    maxPrice?: number;
  },
): Promise<ProductEntity[]> => {
  const queryBuilder = productRepository
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.categories', 'category')
    .leftJoinAndSelect('product.variants', 'variants')
    .where('category.id = :categoryId', { categoryId });

  if (filters?.isActive !== undefined) {
    queryBuilder.andWhere('product.isActive = :isActive', {
      isActive: filters.isActive,
    });
  }

  if (filters?.minStock !== undefined) {
    queryBuilder.andWhere('product.stockLevel >= :minStock', {
      minStock: filters.minStock,
    });
  }

  if (filters?.maxPrice !== undefined) {
    queryBuilder.andWhere('product.price <= :maxPrice', {
      maxPrice: filters.maxPrice,
    });
  }

  return await queryBuilder.getMany();
};

/**
 * Check if category can be deleted (no products)
 */
export const canDeleteCategory = async (
  productRepository: Repository<ProductEntity>,
  categoryId: string,
): Promise<boolean> => {
  const count = await productRepository
    .createQueryBuilder('product')
    .innerJoin('product.categories', 'category')
    .where('category.id = :categoryId', { categoryId })
    .getCount();

  return count === 0;
};

/**
 * Batch operations
 */

/**
 * Update stock levels for multiple variants
 */
export const batchUpdateVariantStock = async (
  variantRepository: Repository<ProductVariantEntity>,
  updates: Array<{ variantId: string; newStock: number }>,
): Promise<void> => {
  for (const { variantId, newStock } of updates) {
    await variantRepository.update(variantId, { stockLevel: newStock });
  }
};

/**
 * Activate/deactivate multiple products
 */
export const batchToggleProductStatus = async (
  productRepository: Repository<ProductEntity>,
  productIds: string[],
  isActive: boolean,
): Promise<void> => {
  await productRepository.update(productIds, { isActive });
};
