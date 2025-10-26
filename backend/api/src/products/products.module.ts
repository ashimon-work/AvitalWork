import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { StoreEntity } from '../stores/entities/store.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { StoresModule } from 'src/stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      StoreEntity,
      CategoryEntity,
      ProductVariantEntity,
    ]),
    StoresModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, Logger],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
