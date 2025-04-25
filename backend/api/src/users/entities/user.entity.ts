import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, // Import OneToMany
} from 'typeorm';
import { User as IUser, Address } from '@shared-types'; // Import shared interface
import { AddressEntity } from '../../addresses/entities/address.entity'; // Import AddressEntity
import { OrderEntity } from '../../orders/entities/order.entity'; // Import OrderEntity
import { WishlistEntity } from '../../wishlist/entities/wishlist.entity'; // Import WishlistEntity

@Entity('users') // Define table name
export class UserEntity implements Omit<IUser, 'roles'> { // Remove 'addresses' from Omit
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
  @Column('simple-array', { default: 'customer' })
  roles: ('customer' | 'manager' | 'admin')[];

  // Addresses might be handled via a separate entity and relation later
  // For now, maybe store default shipping/billing as JSON or separate columns if simple
  // @Column('jsonb', { nullable: true })
  // defaultShippingAddress?: Address;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Add relations later (e.g., orders, wishlist)

  @OneToMany(() => AddressEntity, (address) => address.user)
  addresses: AddressEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];

  @OneToMany(() => WishlistEntity, (wishlist) => wishlist.user)
  wishlists: WishlistEntity[]; // A user can have multiple wishlists (one per store)
}
