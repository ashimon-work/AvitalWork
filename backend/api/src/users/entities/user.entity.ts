import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User as IUser, Address } from '@shared-types'; // Import shared interface

@Entity('users') // Define table name
export class UserEntity implements Omit<IUser, 'addresses' | 'roles'> {
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
}
