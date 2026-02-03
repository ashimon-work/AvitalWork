import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { MessageDispatcher } from './message-dispatcher.service';
import { WelcomeHandler } from './handlers/welcome.handler';
import { MainMenuHandler } from './handlers/main-menu.handler';
import { AddProductHandler } from './handlers/add-product.handler';
import { ManageStoreHandler } from './handlers/manage-store.handler';
import { ManageProductHandler } from './handlers/manage-product.handler';
import { SettingsHandler } from './handlers/settings.handler';
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
  providers: [
    WhatsappService,
    MessageDispatcher,
    WelcomeHandler,
    MainMenuHandler,
    AddProductHandler,
    ManageStoreHandler,
    ManageProductHandler,
    SettingsHandler,
  ],
  exports: [WhatsappService, MessageDispatcher],
})
export class WhatsappModule {}
