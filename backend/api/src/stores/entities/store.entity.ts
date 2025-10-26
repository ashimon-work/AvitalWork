import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  Relation,
} from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { CarouselItem } from '../../carousel/entities/carousel.entity';
import { ShippingMethodEntity } from '../../shipping/entities/shipping-method.entity';

// Define an interface for Store if needed in shared-types later
// import { Store as IStore } from '@shared-types';

@Entity('stores')
export class StoreEntity /* implements IStore */ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  name: string;

  @Index({ unique: true }) // Index for efficient lookup by slug
  @Column({ unique: true })
  slug: string; // Used for URL identification (e.g., my-cool-store)

  @Column('text', { nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  logoUrl?: string;

  @Column({ default: false })
  isFeaturedInMarketplace: boolean;

  @Column('simple-array', { nullable: true })
  authorizedPhoneNumbers?: string[];

  // Relation: A store can have many products
  @OneToMany(() => ProductEntity, (product) => product.store)
  products: Relation<ProductEntity[]>;

  // Relation: A store can have many categories
  @OneToMany(() => CategoryEntity, (category) => category.store)
  categories: Relation<CategoryEntity[]>;

  // Relation: A store can have many carousel items
  @OneToMany(() => CarouselItem, (carouselItem) => carouselItem.store)
  carouselItems: Relation<CarouselItem[]>;

  // Relation: A store can have many shipping methods
  @OneToMany(
    () => ShippingMethodEntity,
    (shippingMethod) => shippingMethod.store,
  )
  shippingMethods: Relation<ShippingMethodEntity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
