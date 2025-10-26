import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, // Import OneToMany
  Relation,
} from 'typeorm';
import { User as IUser, Address, Note } from '@shared-types'; // Import Note
import { AddressEntity } from '../../addresses/entities/address.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { WishlistEntity } from '../../wishlist/entities/wishlist.entity';
import { LoginHistoryEntity } from '../../login-history/entities/login-history.entity';
import { PaymentMethodEntity } from '../../payment-methods/entities/payment-method.entity';
import { NotificationPreferencesDto } from '../dto/notification-preferences.dto';
import { UserRole } from './user-role.enum';

@Entity('users') // Define table name
export class UserEntity implements Omit<IUser, 'roles'> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  passwordHash: string; // Store the hashed password

  // Roles might be handled via a separate entity and relation later
  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.CUSTOMER],
  })
  roles: UserRole[];

  // Addresses might be handled via a separate entity and relation later
  // For now, maybe store default shipping/billing as JSON or separate columns if simple
  // @Column('jsonb', { nullable: true })
  // defaultShippingAddress?: Address;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ nullable: true })
  profilePictureUrl?: string;

  @Column('jsonb', { nullable: true, default: {} })
  notificationPreferences?: NotificationPreferencesDto;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Add relations later (e.g., orders, wishlist)

  @OneToMany(() => AddressEntity, (address) => address.user)
  addresses: Relation<AddressEntity[]>;

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: Relation<OrderEntity[]>;

  @OneToMany(() => WishlistEntity, (wishlist) => wishlist.user)
  wishlists: Relation<WishlistEntity[]>; // A user can have multiple wishlists (one per store)

  @OneToMany(() => LoginHistoryEntity, (loginHistory) => loginHistory.user)
  loginHistory: Relation<LoginHistoryEntity[]>;

  @OneToMany(() => PaymentMethodEntity, (paymentMethod) => paymentMethod.user)
  paymentMethods: Relation<PaymentMethodEntity[]>;

  @Column('jsonb', { nullable: true, default: [] }) // Changed to jsonb and added default
  notes: Note[]; // Changed to Note[]
}
