import { Address } from './user.interface'; // Assuming Address is in user.interface.ts

export interface OrderItem {
  productId: string; // Or number
  productName: string; // Denormalized for display
  variantInfo?: string; // e.g., "Size: L, Color: Blue"
  quantity: number;
  unitPrice: number; // Price at the time of order
  itemSubtotal: number;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string; // Or number
  orderReference: string; // User-friendly reference number
  userId: string; // ID of the customer
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxes: number;
  discountAmount?: number;
  promoCode?: string;
  total: number;
  shippingAddress: Address;
  billingAddress?: Address; // Optional, if different from shipping
  shippingMethod: string;
  paymentMethod: string; // e.g., "Credit Card ending in 1234"
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  notes?: string; // Internal notes
  createdAt: Date;
  updatedAt: Date;
}
