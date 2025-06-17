import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TranzilaService } from './tranzila.service';
import { CreditCardEntity } from './entities/credit-card.entity';
import { TranzilaDocumentEntity } from './entities/tranzila-document.entity';
import { UserEntity } from '../users/entities/user.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CreditCardEntity,
      TranzilaDocumentEntity,
      UserEntity,
      OrderEntity,
    ]),
    ConfigModule,
    AuthModule,
  ],
  providers: [TranzilaService],
  exports: [TranzilaService, TypeOrmModule],
})
export class TranzilaModule {}