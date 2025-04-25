import { OrderStatus, PaymentStatus } from '../entities/order.entity';
import { AddressEntity } from '../../addresses/entities/address.entity'; // Use entity directly for now
import { OrderItemDto } from './order-item.dto';

export class OrderDto {
  id: string;
  orderReference: string;
  orderDate: Date;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  shippingAddress: AddressEntity; // Include full address details
  shippingMethod?: string;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  items: OrderItemDto[]; // Use OrderItemDto
  updatedAt: Date;
  // Exclude user, store details unless specifically needed in this context
}