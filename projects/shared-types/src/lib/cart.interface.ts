import { Product } from './product.interface';
import { User } from './user.interface';
import { Store } from './store.interface';
export interface CartItem {
  id: string; // CartItemEntity ID
  product: Product; // Product details
  quantity: number;
  price?: number; // Price of the product at the time it was added or current price
  // any other relevant fields from CartItemEntity
}

export interface Cart {
  id: string | null; // CartEntity ID, can be null if it's a new guest cart structure not yet saved
  guestCartId?: string;
  userId?: string; // Foreign key
  user?: Partial<User>; // Optional user details
  storeId: string; // Foreign key
  store?: Partial<Store>; // Optional store details
  items: CartItem[];
  
  appliedPromoCode?: string | null;
  discountAmount?: number | null;
  subtotal?: number | null;
  grandTotal?: number | null;
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Add any other fields from CartEntity that are relevant to the frontend
}