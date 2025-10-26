import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistEntity } from './entities/wishlist.entity';
import { WishlistItemEntity } from './entities/wishlist-item.entity';
import { WishlistDto } from './dto/wishlist.dto';
import { WishlistItemDto } from './dto/wishlist-item.dto';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { ProductEntity } from '../products/entities/product.entity'; // Needed for mapping

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistEntity)
    private wishlistRepository: Repository<WishlistEntity>,
    @InjectRepository(WishlistItemEntity)
    private wishlistItemRepository: Repository<WishlistItemEntity>,
    @InjectRepository(ProductEntity) // Inject Product repository to fetch details
    private productRepository: Repository<ProductEntity>,
  ) {}

  // Get or create wishlist for a user in a specific store
  private async getOrCreateWishlist(
    userId: string,
    storeId: string,
  ): Promise<WishlistEntity> {
    let wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId }, store: { id: storeId } },
      relations: ['items', 'items.product'], // Load items and their products
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        user: { id: userId },
        store: { id: storeId },
        items: [],
      });
      await this.wishlistRepository.save(wishlist);
      // Re-fetch with relations after creation if needed, though create might return it
      wishlist = await this.wishlistRepository.findOneOrFail({
        where: { id: wishlist.id },
        relations: ['items', 'items.product'],
      });
    }
    return wishlist;
  }

  async getWishlistForUser(
    userId: string,
    storeId: string,
  ): Promise<WishlistDto> {
    const wishlist = await this.getOrCreateWishlist(userId, storeId);
    return this.mapWishlistToDto(wishlist);
  }

  async addItemToWishlist(
    userId: string,
    storeId: string,
    addItemDto: AddWishlistItemDto,
  ): Promise<WishlistItemDto> {
    const wishlist = await this.getOrCreateWishlist(userId, storeId);

    // Check if product exists (optional, but good practice)
    const product = await this.productRepository.findOneBy({
      id: addItemDto.productId,
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID "${addItemDto.productId}" not found.`,
      );
    }
    // Check if product belongs to the store (important!)
    if (product.storeId !== storeId) {
      throw new ConflictException(`Product does not belong to this store.`);
    }

    // Check if item already exists in this wishlist
    const existingItem = await this.wishlistItemRepository.findOne({
      where: {
        wishlist: { id: wishlist.id },
        product: { id: addItemDto.productId },
      },
    });

    if (existingItem) {
      // Optionally update timestamp or just return existing item DTO
      // For simplicity, let's just return the existing one mapped
      return this.mapWishlistItemToDto(existingItem);
      // throw new ConflictException('Item already exists in wishlist.');
    }

    const newItem = this.wishlistItemRepository.create({
      wishlist: wishlist,
      product: { id: addItemDto.productId },
    });

    const savedItem = await this.wishlistItemRepository.save(newItem);

    // Need to fetch the product details for the DTO response
    const fullItem = await this.wishlistItemRepository.findOneOrFail({
      where: { id: savedItem.id },
      relations: ['product'],
    });

    return this.mapWishlistItemToDto(fullItem);
  }

  async removeItemFromWishlist(
    userId: string,
    storeId: string,
    wishlistItemId: string,
  ): Promise<void> {
    // Ensure the item belongs to the user's wishlist for the store
    const item = await this.wishlistItemRepository.findOne({
      where: {
        id: wishlistItemId,
        wishlist: { user: { id: userId }, store: { id: storeId } },
      },
    });

    if (!item) {
      throw new NotFoundException(
        `Wishlist item with ID "${wishlistItemId}" not found for this user/store.`,
      );
    }

    await this.wishlistItemRepository.remove(item);
  }

  // Helper to map WishlistEntity to WishlistDto
  private mapWishlistToDto(wishlist: WishlistEntity): WishlistDto {
    return {
      id: wishlist.id,
      userId: wishlist.userId,
      storeId: wishlist.storeId,
      items:
        wishlist.items?.map((item) => this.mapWishlistItemToDto(item)) || [],
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  // Helper to map WishlistItemEntity to WishlistItemDto
  private mapWishlistItemToDto(item: WishlistItemEntity): WishlistItemDto {
    // Ensure product details are loaded
    if (!item.product) {
      // This shouldn't happen if relations are loaded correctly, but handle defensively
      console.warn(`Product details missing for wishlist item ${item.id}`);
      // Potentially throw an error or return partial data
    }
    return {
      id: item.id,
      productId: item.productId,
      addedAt: item.addedAt,
      // Map relevant product details
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            imageUrls: item.product.imageUrls
              ? [item.product.imageUrls[0]]
              : undefined, // Use the first image URL as an array
            // slug: item.product.slug, // No slug property on ProductEntity
            // Add other needed product fields
          }
        : ({ id: item.productId } as Partial<ProductEntity>), // Fallback if product data is missing
    };
  }
}
