import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationEntity } from './entities/notification.entity';
// import { UsersModule } from '../users/users.module'; // Import if NotificationsService depends on UserEntity/UsersService

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    // UsersModule, // Include if UserEntity or UsersService is directly used by NotificationsService
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // Export service if it needs to be used by other modules (e.g., for creating notifications programmatically)
})
export class NotificationsModule {}