import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne, // Import ManyToOne
  JoinColumn, // Import JoinColumn for explicit foreign key naming
  OneToMany, // Import OneToMany for variants
  ManyToMany, // Import ManyToMany for categories
  JoinTable, // Import JoinTable for ManyToMany
  Relation,
} from 'typeorm';
// import { Product as IProduct } from '@shared-types'; // No longer implementing directly
import { StoreEntity } from '../../stores/entities/store.entity';
import { ProductVariantEntity } from './product-variant.entity'; // Import Variant Entity
import { CategoryEntity } from '../../categories/entities/category.entity'; // Import Category Entity

@Entity('products')
export class ProductEntity {
  // Remove implements clause
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

  // Replace single imageUrl with array
  @Column('simple-array', { default: '{}' }) // Use default empty array for non-nullability if desired
  imageUrls: string[];

  // Relation: Categories (Many-to-Many)
  @ManyToMany(() => CategoryEntity, { cascade: true }) // Cascade for easier management? Decide based on needs.
  @JoinTable({
    name: 'product_categories', // Name of the join table
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: CategoryEntity[];

  @Column('simple-array', { nullable: true })
  tags?: string[];

  // Add variant option definitions
  @Column('simple-array', { nullable: true })
  options?: string[]; // e.g., ['Color', 'Size']

  @Column('int') // Use integer for stock
  stockLevel: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeaturedInMarketplace: boolean;

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
  store: Relation<StoreEntity>;

  @Column() // Add the foreign key column explicitly if needed for queries without relation loading
  storeId: string;

  // Relation: Variants (One-to-Many)
  @OneToMany(() => ProductVariantEntity, (variant) => variant.product, {
    cascade: true, // Automatically save/update/remove variants when product is saved/removed
    eager: false, // Load variants explicitly when needed
  })
  variants: Relation<ProductVariantEntity[]>;

  // Add other relations later (e.g., reviews)
}
