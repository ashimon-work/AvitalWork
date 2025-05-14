import { Product } from './product.interface';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  // Add other relevant cart item properties like price at time of adding
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  // Add other relevant cart properties like total, discount, etc.
}