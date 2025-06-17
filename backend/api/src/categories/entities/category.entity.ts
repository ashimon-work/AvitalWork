import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  ManyToMany, // Import ManyToMany
} from 'typeorm';
// import { Category as ICategory } from '@shared-types'; // Remove implements
import { StoreEntity } from '../../stores/entities/store.entity';
import { ProductEntity } from '../../products/entities/product.entity'; // Import ProductEntity

@Entity('categories')
export class CategoryEntity { // Remove implements
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: false })
  isFeaturedInMarketplace: boolean;

  @ManyToOne(() => StoreEntity, (store) => store.categories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'storeId' })
  store: StoreEntity;

  @Column()
  storeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  // Relation: Products (Many-to-Many, inverse side)
  @ManyToMany(() => ProductEntity, (product) => product.categories)
  // No @JoinTable needed here, it's defined on ProductEntity
  products: ProductEntity[];
}