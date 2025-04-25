import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { AccountModule } from './account/account.module';
import { StoresModule } from './stores/stores.module';
import { CarouselModule } from './carousel/carousel.module';
import { NavigationModule } from './navigation/navigation.module';
import { AddressesModule } from './addresses/addresses.module';
import { OrdersModule } from './orders/orders.module';
import { WishlistModule } from './wishlist/wishlist.module';

// Import all entities used in the seed script
import { StoreEntity } from './stores/entities/store.entity';
import { CategoryEntity } from './categories/entities/category.entity';
import { ProductEntity } from './products/entities/product.entity';
import { ProductVariantEntity } from './products/entities/product-variant.entity';
import { UserEntity } from './users/entities/user.entity';
import { AddressEntity } from './addresses/entities/address.entity';
import { OrderEntity } from './orders/entities/order.entity';
import { OrderItemEntity } from './orders/entities/order-item.entity';
import { WishlistEntity } from './wishlist/entities/wishlist.entity';
import { WishlistItemEntity } from './wishlist/entities/wishlist-item.entity';
import { CarouselItem } from './carousel/entities/carousel.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'postgres'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'password'),
        database: configService.get<string>('POSTGRES_DB', 'magic_store'),
        entities: [
          __dirname + '/**/*.entity{.ts,.js}', // Use glob pattern to find all entities
        ],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    // Explicitly provide repositories for entities used in seed script
    TypeOrmModule.forFeature([
      StoreEntity,
      CategoryEntity,
      ProductEntity,
      ProductVariantEntity,
      UserEntity,
      AddressEntity,
      OrderEntity,
      OrderItemEntity,
      WishlistEntity,
      WishlistItemEntity,
      CarouselItem,
    ]),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    AccountModule,
    StoresModule,
    CarouselModule,
    NavigationModule,
    AddressesModule,
    OrdersModule,
    WishlistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
