import { StoreEntity } from '../../stores/entities/store.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';

@Entity('shipping_methods')
export class ShippingMethodEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'int', nullable: true })
  estimatedDeliveryDays?: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => StoreEntity, (store) => store.shippingMethods, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'storeId' })
  store: Relation<StoreEntity>;

  @Column()
  storeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
