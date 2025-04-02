import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Category as ICategory } from '@shared-types';

@Entity('categories')
export class CategoryEntity implements ICategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true }) // Add index for name
  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true }) // Description is optional
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  // Add relations later (e.g., products using ManyToMany)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}