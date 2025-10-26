import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('conversation_states')
export class ConversationStateEntity {
  @PrimaryColumn()
  userId: string; // WhatsApp ID

  @Column()
  currentState: string;

  @Column('jsonb', { nullable: true, default: '{"language": "en"}' })
  context: {
    language?: 'en' | 'he';
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
