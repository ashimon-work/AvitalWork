import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../orders/entities/order.entity';
import { OrderItemEntity } from '../orders/entities/order-item.entity';
import { CartEntity } from '../cart/entities/cart.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { AddressEntity } from '../addresses/entities/address.entity';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { TranzilaModule } from '../tranzila/tranzila.module';
import { CreditCardEntity } from '../tranzila/entities/credit-card.entity';
import { TranzilaDocumentEntity } from '../tranzila/entities/tranzila-document.entity';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      CartEntity,
      ProductEntity,
      AddressEntity,
      UserEntity,
      StoreEntity,
      CreditCardEntity,
      TranzilaDocumentEntity,
    ]),
    TranzilaModule,
    StoresModule,
  ],
  providers: [CheckoutService],
  controllers: [CheckoutController],
  exports: [CheckoutService],
})
export class CheckoutModule {}
