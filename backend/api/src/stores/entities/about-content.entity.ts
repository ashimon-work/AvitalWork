import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { StoreEntity } from './store.entity';

@Entity('about_content')
export class AboutContentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  title: string;

  @Column('text')
  content: string;

  @Column('varchar', { nullable: true })
  imageUrl: string;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  store: StoreEntity;
}