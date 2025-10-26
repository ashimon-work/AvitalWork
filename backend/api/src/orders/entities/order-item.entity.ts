import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderEntity, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' }) // Explicit join column
  order: Relation<OrderEntity>;

  @Column() // Store orderId directly
  orderId: string;

  @ManyToOne(() => ProductEntity, {
    nullable: false,
    eager: true,
    onDelete: 'RESTRICT',
  }) // Eager load product, prevent product deletion if in order
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column() // Store productId directly
  productId: string;

  @Column({ type: 'uuid', nullable: true }) // Store variantId directly if applicable
  variantId?: string;

  @Column()
  quantity: number;

  // Store price/name at the time of order to prevent changes if product details update later
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerUnit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPricePerUnit?: number;

  @Column({ length: 255 })
  productName: string; // Snapshot of product name

  // Optional: Store selected variant details if applicable
  @Column({ type: 'varchar', length: 255, nullable: true })
  variantDetails?: string; // e.g., "Size: L, Color: Blue" or just "Large"
}
