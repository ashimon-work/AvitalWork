import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingMethodEntity } from './entities/shipping-method.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { StoresModule } from '../stores/stores.module';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShippingMethodEntity, StoreEntity]),
    StoresModule,
  ],
  providers: [ShippingService],
  controllers: [ShippingController],
  exports: [ShippingService],
})
export class ShippingModule {}