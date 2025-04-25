import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
// Import Controller and Service later when created
import { OrdersController } from './orders.controller'; // Import Controller
import { OrdersService } from './orders.service'; // Import Service

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity])],
  controllers: [OrdersController], // Add Controller
  providers: [OrdersService], // Add Service
})
export class OrdersModule {}