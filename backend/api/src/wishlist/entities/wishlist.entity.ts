import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Column,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { WishlistItemEntity } from './wishlist-item.entity';

@Entity('wishlists')
@Unique(['userId', 'storeId']) // Ensure only one wishlist per user per store
export class WishlistEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @ManyToOne(() => StoreEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: StoreEntity;

  @Column()
  storeId: string;

  @OneToMany(() => WishlistItemEntity, (item) => item.wishlist, { cascade: true, eager: true })
  items: WishlistItemEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}