import { OrderStatus, PaymentStatus } from '../entities/order.entity';
import { AddressEntity } from '../../addresses/entities/address.entity';
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
  shippingAddress: AddressEntity;
  shippingMethod?: string;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  items: OrderItemDto[];
  updatedAt: Date;
  notes: string[];
  user?: OrderUserDto;
}

export interface OrderUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}