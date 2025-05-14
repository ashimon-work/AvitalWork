import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { StoreEntity } from './store.entity';

@Entity('testimonials')
export class TestimonialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  author: string;

  @Column('text')
  quote: string;

  @Column('timestamp', { nullable: true })
  date: Date;

  @Column('int', { nullable: true })
  rating: number;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  store: StoreEntity;
}