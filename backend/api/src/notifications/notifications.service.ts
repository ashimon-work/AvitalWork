import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
// import { UserEntity } from '../users/entities/user.entity'; // Import if you need to validate userId against UserEntity

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationsRepository: Repository<NotificationEntity>,
    // @InjectRepository(UserEntity) // Inject User repository if needed for validation
    // private usersRepository: Repository<UserEntity>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationEntity> {
    // Optional: Validate if userId exists
    // const user = await this.usersRepository.findOneBy({ id: createNotificationDto.userId });
    // if (!user) {
    //   throw new NotFoundException(`User with ID ${createNotificationDto.userId} not found`);
    // }

    const notification = this.notificationsRepository.create(createNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async findAllForUser(userId: string, storeSlug?: string): Promise<NotificationEntity[]> {
    // TODO: Add pagination, sorting, and filtering (e.g., by read status, type)
    // If storeId is added to NotificationEntity, filter by storeSlug (which maps to storeId)
    const queryOptions: any = { where: { userId }, order: { createdAt: 'DESC' } };
    // if (storeSlug) {
      // Assuming you have a way to get storeId from storeSlug
      // const store = await this.storesRepository.findOneBy({ slug: storeSlug });
      // if (store) {
      //   queryOptions.where.storeId = store.id;
      // } else {
      //   return []; // Or throw error if store context is mandatory and not found
      // }
    // }
    return this.notificationsRepository.find(queryOptions);
  }

  async findOne(id: string, userId: string): Promise<NotificationEntity> {
    const notification = await this.notificationsRepository.findOneBy({ id, userId });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} for user ${userId} not found`);
    }
    return notification;
  }

  async update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<NotificationEntity> {
    const notification = await this.findOne(id, userId); // Ensures user owns the notification

    // Create a new object for the update payload to ensure type compatibility with TypeORM
    const updatePayload: Partial<NotificationEntity> = { ...updateNotificationDto };

    if (updateNotificationDto.isRead === true && !notification.isRead) {
      updatePayload.readAt = new Date();
    } else if (updateNotificationDto.isRead === false) {
      updatePayload.readAt = null;
    }
    
    // Remove isRead from updatePayload if it's the only property and we're just setting readAt
    // Or ensure that the DTO only contains properties that are actual fields in the entity for update
    // For now, we assume UpdateNotificationDto fields are fine.
    
    await this.notificationsRepository.update(id, updatePayload);
    // Fetch the updated notification again to ensure we return the complete and correct entity
    const updatedNotification = await this.findOne(id, userId);
    if (!updatedNotification) {
      // This should ideally not happen if findOne throws on not found
      throw new NotFoundException(`Notification with ID ${id} for user ${userId} not found after update`);
    }
    return updatedNotification;
  }

  async markAllAsRead(userId: string, storeSlug?: string): Promise<{ updated: number }> {
    // const whereClause: any = { userId, isRead: false };
    // if (storeSlug) { /* Add storeId to whereClause if applicable */ }
    // For now, marking all for user regardless of store, adjust if storeId is added
    const result = await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { updated: result.affected || 0 };
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId); // Ensures user owns the notification
    await this.notificationsRepository.delete(id);
  }

  async removeAllForUser(userId: string, storeSlug?: string): Promise<{ deleted: number }> {
    // const whereClause: any = { userId };
    // if (storeSlug) { /* Add storeId to whereClause if applicable */ }
    // For now, deleting all for user regardless of store
    const result = await this.notificationsRepository.delete({ userId });
    return { deleted: result.affected || 0 };
  }
}