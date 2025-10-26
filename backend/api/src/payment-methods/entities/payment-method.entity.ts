import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  Relation,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { AddressEntity } from '../../addresses/entities/address.entity';

@Entity('payment_methods')
@Index(['user', 'store']) // Index for querying by user and store
export class PaymentMethodEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.paymentMethods, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: Relation<UserEntity>;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE', nullable: false }) // Assuming payment methods are store-specific
  store: StoreEntity;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Type of payment method, e.g., card, paypal',
  })
  type: string;

  // For card payments, store details from payment gateway (e.g., Stripe, Braintree)
  // NEVER store raw card numbers, CVV, or full expiry dates directly unless PCI compliant.
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ID from the payment gateway for this payment method',
  })
  paymentGatewayToken?: string; // e.g., Stripe's pm_xxxx or card_xxxx

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Brand of the card, e.g., Visa, Mastercard',
  })
  cardBrand?: string;

  @Column({
    type: 'varchar',
    length: 4,
    nullable: true,
    comment: 'Last 4 digits of the card',
  })
  last4?: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Card expiration month (MM)',
  })
  expiryMonth?: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Card expiration year (YYYY)',
  })
  expiryYear?: number;

  // Billing address associated with this payment method
  @ManyToOne(() => AddressEntity, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  }) // Eager load for convenience, set null if address deleted
  billingAddress?: Relation<AddressEntity>;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Is this the default payment method for the user in this store?',
  })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional metadata from payment gateway or for other types',
  })
  metadata?: Record<string, any>;
}
