import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('credit_cards')
@Index(['user']) // Index for querying by user
export class CreditCardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: false })
  user: UserEntity;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Tranzila token (TranzilaTK)' })
  token: string;

  @Column({ type: 'varchar', length: 4, nullable: true, comment: 'Last 4 digits of the card' })
  lastFour?: string;

  @Column({ type: 'varchar', length: 4, nullable: false, comment: 'Card expiry date in MMYY format' })
  expdate: string;

  @Column({ type: 'boolean', default: true, comment: 'Is this the default payment method for the user?' })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true, comment: 'Additional metadata' })
  metadata?: Record<string, any>;
} 