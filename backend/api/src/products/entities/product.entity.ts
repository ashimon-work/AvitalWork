import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product as IProduct } from '@shared-types';

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

  // Add relations later (e.g., categories, variants, reviews)
}
