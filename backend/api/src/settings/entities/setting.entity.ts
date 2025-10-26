import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { StoreEntity } from '../../stores/entities/store.entity';

@Entity()
@Index(['store', 'category', 'key'], { unique: true })
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  store: StoreEntity;

  @Column()
  category: string;

  @Column()
  key: string;

  @Column('jsonb') // Use jsonb for flexible value storage
  value: any;
}
