import { WishlistItemDto } from './wishlist-item.dto';

export class WishlistDto {
  id: string; // Wishlist ID
  userId: string;
  storeId: string;
  items: WishlistItemDto[];
  createdAt: Date;
  updatedAt: Date;
}
