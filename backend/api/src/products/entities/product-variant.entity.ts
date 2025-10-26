import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Relation,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductVariantOptionDto } from '../dto/product-variant-option.dto';
@Entity('product_variants')
@Index(['product', 'sku'], { unique: true }) // Ensure variant SKU is unique within a product
export class ProductVariantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relation: A variant belongs to one product
  @ManyToOne(() => ProductEntity, (product) => product.variants, {
    nullable: false,
    onDelete: 'CASCADE', // If product is deleted, delete its variants
  })
  @JoinColumn({ name: 'productId' }) // Foreign key column
  product: Relation<ProductEntity>;

  @Column() // Store the productId explicitly for easier querying if needed
  productId: string;

  @Column({ unique: true }) // Variant-specific SKU
  sku: string;

  // Store the defining options as JSON
  // Example: [{ name: 'Color', value: 'Red' }, { name: 'Size', value: 'Large' }]
  @Column('jsonb')
  options: ProductVariantOptionDto[];

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price?: number; // Overrides product base price if set

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  costPrice?: number;

  @Column('int')
  stockLevel: number;

  @Column({ nullable: true })
  imageUrl?: string; // Variant-specific image

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
