import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistEntity } from './entities/wishlist.entity';
import { WishlistItemEntity } from './entities/wishlist-item.entity';
import { WishlistController } from './wishlist.controller'; // Import Controller
import { WishlistService } from './wishlist.service'; // Import Service
import { ProductsModule } from '../products/products.module'; // Import ProductsModule
import { StoresModule } from '../stores/stores.module'; // Import StoresModule
@Module({
  imports: [
    TypeOrmModule.forFeature([WishlistEntity, WishlistItemEntity]),
    ProductsModule, // Add ProductsModule here
    StoresModule, // Add StoresModule here
  ],
  controllers: [WishlistController], // Add Controller
  providers: [WishlistService], // Add Service
})
export class WishlistModule {}
