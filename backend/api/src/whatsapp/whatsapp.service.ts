import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ConversationStateEntity } from './entities/conversation-state.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ProductVariantEntity } from 'src/products/entities/product-variant.entity';
import { StoreEntity } from 'src/stores/entities/store.entity';
import { UserRole } from 'src/users/entities/user-role.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { MessageDispatcher } from './message-dispatcher.service';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { getLang, getMessage, invalidThenPrompt } from './helpers';

@Injectable()
export class WhatsappService {
  private readonly verifyToken: string;
  constructor(
    @InjectRepository(ConversationStateEntity)
    readonly conversationStateRepository: Repository<ConversationStateEntity>,
    @InjectRepository(CategoryEntity)
    readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductVariantEntity)
    readonly productVariantRepository: Repository<ProductVariantEntity>,
    @InjectRepository(StoreEntity)
    readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(UserEntity)
    readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OrderEntity)
    readonly orderRepository: Repository<OrderEntity>,
    readonly configService: ConfigService,
    private readonly messageDispatcher: MessageDispatcher,
  ) {
    this.verifyToken = this.configService.get<string>(
      'WHATSAPP_VERIFY_TOKEN',
      'smarty-bot-very-secret-token',
    );
  }

  verifyWebhook(mode: string, challenge: string, token: string): boolean {
    // Verification logic for WhatsApp webhook
    return mode === 'subscribe' && token === this.verifyToken;
  }

  async handleIncomingMessage(body: any): Promise<any> {
    console.log('Received webhook:', JSON.stringify(body, null, 2));

    if (body.object) {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.value?.statuses) {
            // This is a status update (e.g., read receipt), not an incoming message.
            // We can ignore it.
            continue;
          }

          if (change.field === 'messages' && change.value?.messages) {
            for (const message of change.value.messages) {
              const from = message.from;
              const messageText =
                message.text?.body?.toLowerCase() ||
                message.interactive?.button_reply?.id ||
                (message.type === 'image' ? 'image' : undefined);

              if (!from || !messageText) {
                continue;
              }

              const user = await this.userRepository.findOne({
                where: { phone: `+${from}` },
              });
              if (!user) {
                await this.sendUnauthorizedMessage(from);
                continue;
              }
              const store = await this.storeRepository.findOne({
                where: { authorizedPhoneNumbers: Like(`%${from}%`) },
              });
              if (!store) {
                await this.sendUnauthorizedMessage(from);
                continue;
              }

              let conversationState =
                await this.conversationStateRepository.findOne({
                  where: { userId: from },
                });

              if (!conversationState) {
                conversationState = await this.conversationStateRepository.save(
                  {
                    userId: from,
                    currentState: 'welcome',
                    context: { language: 'he', storeId: store.id },
                  },
                );
              } else {
                conversationState.context = {
                  ...(conversationState.context || {}),
                  storeId: store.id,
                };
              }

              const newState = await this.messageDispatcher.dispatch(
                this,
                conversationState,
                messageText,
                message,
              );
              await this.conversationStateRepository.save(newState);
            }
          }
        }
      }
    }

    return { status: 'received' };
  }

  private async sendUnauthorizedMessage(to: string) {
    await this.sendWhatsAppMessage(to, getMessage('en', 'unauthorized'));
  }

  async sendWhatsAppMessage(
    to: string,
    text: string,
    buttons?: { id: string; title: string }[],
  ) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    console.log('used whatsapp acess token:', accessToken);
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

    const data: any = {
      messaging_product: 'whatsapp',
      to,
    };

    if (buttons && buttons.length > 0) {
      // Validate button titles length (WhatsApp requirement: 1-20 characters)
      const invalidButtons = buttons.filter(
        (btn) => !btn.title || btn.title.length < 1 || btn.title.length > 20,
      );

      if (invalidButtons.length > 0) {
        console.error('Button title length validation failed:', {
          invalidButtons,
          allButtons: buttons,
        });
        // Truncate or fix invalid button titles
        buttons = buttons.map((btn) => ({
          ...btn,
          title:
            btn.title && btn.title.length > 20
              ? btn.title.substring(0, 20)
              : btn.title || 'Button',
        }));
        console.log('Fixed buttons:', buttons);
      }

      console.log('Sending WhatsApp message with buttons:', {
        to,
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        buttons: buttons.map((btn) => ({
          id: btn.id,
          title: btn.title,
          length: btn.title.length,
        })),
      });

      data.type = 'interactive';
      data.interactive = {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.map((btn) => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title,
            },
          })),
        },
      };
    } else {
      data.text = { body: text };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log('Message sent:', responseData);

      // Log error details if there was an error
      if (responseData.error) {
        console.error('WhatsApp API Error Details:', {
          error: responseData.error,
          buttons: buttons
            ? buttons.map((btn) => ({ id: btn.id, title: btn.title }))
            : null,
          messageLength: text.length,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Failed message details:', {
        to,
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        buttons: buttons
          ? buttons.map((btn) => ({ id: btn.id, title: btn.title }))
          : null,
      });
    }
  }
}
