import { Logger, Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AuthModule } from '../auth/auth.module';
import { StoresModule } from 'src/stores/stores.module';
import { StoresService } from 'src/stores/stores.service';
import { AddressesModule } from 'src/addresses/addresses.module';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [
    AuthModule,
    StoresModule,
    UsersModule,
    OrdersModule,
    AddressesModule,
    CartModule,
  ],
  controllers: [AccountController],
  providers: [StoresService, Logger],
})
export class AccountModule {}
