import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('web_chat_messages')
export class WebChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // The developer ID (without 'web-' prefix usually, or with? Let's stick to what the service uses)
  // Service uses `web-${developerId}` for conversation state, but `developerId` for auth.
  // Let's store the `developerId` to easily query by the logged-in user.

  @Column()
  sender: 'user' | 'bot';

  @Column('text')
  content: string;

  @Column('jsonb', { nullable: true })
  buttons: Array<{ id: string; title: string }>;

  @CreateDateColumn()
  createdAt: Date;
}
