import { ProductEntity } from '../../products/entities/product.entity';

export class WishlistItemDto {
  id: string; // Wishlist Item ID
  productId: string;
  addedAt: Date;
  product: Partial<ProductEntity>; // Include necessary product details (name, price, image)
}
