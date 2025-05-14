import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrdersController } from './orders.controller'; // Manager controller
import { StorefrontOrdersController } from './storefront-orders.controller'; // Storefront controller
import { OrdersService } from './orders.service';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { StoresModule } from '../stores/stores.module';
import { UsersModule } from '../users/users.module';
import { AddressesModule } from '../addresses/addresses.module';
import { ProductsModule } from '../products/products.module';
import { CartModule } from '../cart/cart.module';
import { AuthModule } from '../auth/auth.module'; // For JwtAuthGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    AuthModule, // For JwtAuthGuard used in StorefrontOrdersController
    StoresModule,
    UsersModule,
    AddressesModule,
    ProductsModule,
    CartModule,
  ],
  controllers: [OrdersController, StorefrontOrdersController],
  providers: [OrdersService, StoreContextGuard, Logger], // Added Logger here, though often available globally
  exports: [OrdersService],
})
export class OrdersModule {}