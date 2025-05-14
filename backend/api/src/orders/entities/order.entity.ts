import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { AddressEntity } from '../../addresses/entities/address.entity'; // Assuming we link to an address
import { OrderItemEntity } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed', // Added for payment failures etc.
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Consider a user-friendly order number/reference as well
  @Column({ unique: true })
  orderReference: string; // We'll need a way to generate this

  @ManyToOne(() => UserEntity, { nullable: false, eager: false }) // Don't eager load user by default
  @JoinColumn({ name: 'userId' }) // Explicit join column name
  user: UserEntity;

  @Column() // Store userId directly for easier querying if needed
  userId: string;

  @ManyToOne(() => StoreEntity, { nullable: false, eager: false }) // Orders belong to a store
  @JoinColumn({ name: 'storeId' })
  store: StoreEntity;

  @Column()
  storeId: string;

  @CreateDateColumn()
  orderDate: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Total amount including tax and shipping, excluding discounts applied via promo codes',
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Subtotal before shipping and taxes',
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  shippingCost: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  taxAmount: number;

  // Link to the Address entity used for shipping
  @ManyToOne(() => AddressEntity, { nullable: true, eager: true }) // Eager load address details
  @JoinColumn({ name: 'shippingAddressId' })
  shippingAddress: AddressEntity;

  // Optional: Store billing address separately if needed, or assume same as shipping/user default
  @ManyToOne(() => AddressEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'billingAddressId' })
  billingAddress: AddressEntity;

  @Column({ length: 100, nullable: true })
  shippingMethod?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  promoCode?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Discount amount applied from promo code or other offers',
  })
  discountAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ length: 100, nullable: true })
  trackingNumber?: string;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true, eager: true }) // Cascade saves/updates, eager load items
  items: OrderItemEntity[];

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  fulfilledAt?: Date;

  @Column('text', { array: true, default: [] })
  notes: string[];

  // TODO: Add promo code relation/details if needed
}