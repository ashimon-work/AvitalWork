import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column } from 'typeorm';
import { WishlistEntity } from './wishlist.entity';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity('wishlist_items')
export class WishlistItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WishlistEntity, (wishlist) => wishlist.items, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wishlistId' })
  wishlist: WishlistEntity;

  @Column()
  wishlistId: string;

  @ManyToOne(() => ProductEntity, { nullable: false, eager: true, onDelete: 'CASCADE' }) // Cascade delete if product removed? Or Restrict? Let's cascade for now.
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column()
  productId: string;

  @CreateDateColumn()
  addedAt: Date;
}