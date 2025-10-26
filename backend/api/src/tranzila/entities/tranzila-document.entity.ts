import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';

@Entity('tranzila_documents')
export class TranzilaDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Link to either an order or could be extended for other entities
  @ManyToOne(() => OrderEntity, { nullable: true, onDelete: 'CASCADE' })
  order?: OrderEntity;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Internal transaction/reference ID',
  })
  @Index()
  transactionId?: string;

  @Column({
    type: 'integer',
    nullable: false,
    comment: 'Tranzila internal document ID',
  })
  @Index()
  tranzilaDocumentId: number;

  @Column({
    type: 'integer',
    nullable: false,
    comment: 'Official document number (invoice/receipt number)',
  })
  @Index()
  tranzilaDocumentNumber: number;

  @Column({
    type: 'varchar',
    nullable: false,
    comment: 'Key to view/retrieve the document from Tranzila portal',
  })
  tranzilaRetrievalKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional metadata from Tranzila response',
  })
  metadata?: Record<string, any>;
}
