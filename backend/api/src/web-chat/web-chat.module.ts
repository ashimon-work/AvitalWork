import { Module } from '@nestjs/common';
import { WebChatController } from './web-chat.controller';
import { WebChatService } from './web-chat.service';
import { WebChatGateway } from './web-chat.gateway';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationStateEntity } from '../whatsapp/entities/conversation-state.entity';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { WebChatMessageEntity } from './entities/web-chat-message.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    WhatsappModule,
    TypeOrmModule.forFeature([
      ConversationStateEntity,
      UserEntity,
      StoreEntity,
      OrderEntity,
      WebChatMessageEntity,
    ]),
    AuthModule,
  ],
  controllers: [WebChatController],
  providers: [WebChatService, WebChatGateway],
})
export class WebChatModule {}

