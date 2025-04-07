import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StoreEntity } from '../../stores/entities/store.entity';

@Entity('carousel_items')
export class CarouselItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  imageUrl: string;

  @Column()
  altText: string;

  @Column({ nullable: true })
  linkUrl?: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @ManyToOne(() => StoreEntity, store => store.carouselItems, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'storeId' })
  store: StoreEntity;
}