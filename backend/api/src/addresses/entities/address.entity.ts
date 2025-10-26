import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Relation,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('addresses')
export class AddressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.addresses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: Relation<UserEntity>;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 255 })
  street1: string; // Renamed from streetAddress1

  @Column({ length: 255, nullable: true })
  street2?: string; // Renamed from streetAddress2

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  // state: string; // Removed state
  @Column({ length: 20 })
  postalCode: string;

  @Column({ length: 100 })
  country: string; // Consider making this an enum or separate entity later if needed

  @Column({ length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ default: false })
  isDefaultShipping: boolean;

  @Column({ default: false })
  isDefaultBilling: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
