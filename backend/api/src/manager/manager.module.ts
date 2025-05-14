import { MulterModule } from '@nestjs/platform-express';
import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { StoreEntity } from '../stores/entities/store.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ManagerGateway } from './manager.gateway';
import { ProductsService } from '../products/products.service';
import { CategoryEntity } from '../categories/entities/category.entity';
import { OrdersModule } from '../orders/orders.module';
import { UsersService } from '../users/users.service';
import { SettingsModule } from '../settings/settings.module';
import { StoresModule } from 'src/stores/stores.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { LoginHistoryModule } from '../login-history/login-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreEntity, OrderEntity, ProductEntity, ProductVariantEntity, UserEntity, CategoryEntity]),
    MulterModule.register({}),
    OrdersModule,
    SettingsModule,
    StoresModule,
    AuthModule,
    UsersModule,
    LoginHistoryModule,
  ],
  controllers: [ManagerController],
  providers: [ManagerService, ManagerGateway, ProductsService, UsersService, Logger],
})
export class ManagerModule { }
