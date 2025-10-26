import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { ConversationStateEntity } from './entities/conversation-state.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ProductVariantEntity } from 'src/products/entities/product-variant.entity';
import { StoreEntity } from 'src/stores/entities/store.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderEntity } from 'src/orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationStateEntity,
      CategoryEntity,
      ProductEntity,
      ProductVariantEntity,
      StoreEntity,
      UserEntity,
      OrderEntity,
    ]),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
