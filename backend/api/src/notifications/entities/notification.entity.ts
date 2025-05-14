import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum NotificationType {
  NEW_ORDER = 'NEW_ORDER',
  LOW_STOCK = 'LOW_STOCK',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  ORDER_STATUS_UPDATE = 'ORDER_STATUS_UPDATE',
  NEW_CUSTOMER_REVIEW = 'NEW_CUSTOMER_REVIEW',
  // Add other relevant notification types
}

export enum NotificationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', comment: 'ID of the user (manager) this notification is for' })
  userId: string; // Assuming manager users have UUIDs

  @Column({
    type: 'enum',
    enum: NotificationType,
    comment: 'Type of the notification',
  })
  type: NotificationType;

  @Column({ length: 255, comment: 'Brief title of the notification' })
  title: string;

  @Column({ type: 'text', comment: 'Detailed message of the notification' })
  message: string;

  @Column({ default: false, comment: 'Indicates if the notification has been read' })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', comment: 'Timestamp when the notification was created' })
  createdAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true, comment: 'Timestamp when the notification was read' })
  readAt?: Date | null;

  @Column({ type: 'varchar', length: 512, nullable: true, comment: 'Optional link related to the notification (e.g., to an order or product)' })
  link?: string;

  @Column({
    type: 'enum',
    enum: NotificationSeverity,
    default: NotificationSeverity.INFO,
    comment: 'Severity level of the notification',
  })
  severity: NotificationSeverity;

  // Potentially add a relation to the UserEntity if needed for joins
  // @ManyToOne(() => UserEntity)
  // @JoinColumn({ name: 'userId' })
  // user: UserEntity;

  // Add storeId if notifications are store-specific and a manager can manage multiple stores
  // @Index()
  // @Column({ type: 'uuid', nullable: true, comment: 'ID of the store this notification pertains to, if applicable' })
  // storeId?: string;
}