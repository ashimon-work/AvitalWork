import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne, // Import ManyToOne
  JoinColumn, // Import JoinColumn for explicit foreign key naming
} from 'typeorm';
import { Product as IProduct } from '@shared-types';
import { StoreEntity } from '../../stores/entities/store.entity'; // Import StoreEntity

@Entity('products')
export class ProductEntity implements Omit<IProduct, 'categoryIds'> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true }) // Add index for SKU
  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column('text') // Use 'text' for potentially long descriptions
  description: string;

  @Column('decimal', { precision: 10, scale: 2 }) // Use decimal for currency
  price: number;

  @Column({ nullable: true })
  imageUrl?: string;

  // Categories will likely be a ManyToMany relation later
  // For now, we might omit or store as simple-array if needed temporarily
  // @Column('simple-array', { nullable: true })
  // categoryIds?: string[];

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column('int') // Use integer for stock
  stockLevel: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relation: A product belongs to one store
  @ManyToOne(() => StoreEntity, (store) => store.products, {
    nullable: false, // A product must belong to a store
    onDelete: 'CASCADE', // Optional: Delete products if store is deleted
  })
  @JoinColumn({ name: 'storeId' }) // Explicitly define the foreign key column name
  store: StoreEntity;

  @Column() // Add the foreign key column explicitly if needed for queries without relation loading
  storeId: string;

  // Add relations later (e.g., categories, variants, reviews)
}
