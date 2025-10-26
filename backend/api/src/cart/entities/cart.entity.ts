import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
  Relation,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { CartItemEntity } from './cart-item.entity';

@Entity('carts')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, unique: true })
  @Index()
  guestCartId?: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  guest_session_id?: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  user?: UserEntity;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  store: StoreEntity;

  @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
  items: Relation<CartItemEntity[]>;

  @Column({ type: 'varchar', nullable: true })
  appliedPromoCode?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal?: number; // To store the sum of item prices * quantity

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  grandTotal?: number; // To store the final amount after discounts, taxes, shipping

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
