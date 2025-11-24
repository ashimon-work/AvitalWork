import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationStateEntity } from '../whatsapp/entities/conversation-state.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { handleState } from '../whatsapp/state-machine';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { OrderEntity } from '../orders/entities/order.entity';

@Injectable()
export class WebChatService {
  constructor(
    private readonly whatsappService: WhatsappService,
    @InjectRepository(ConversationStateEntity)
    private readonly conversationStateRepository: Repository<ConversationStateEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async handleDeveloperMessage(developerId: string, messageText: string) {
    // 1. Prefix the user ID to prevent collisions with real WhatsApp users.
    const conversationUserId = `web-${developerId}`;

    // 2. Find the developer's associated store to correctly initialize the bot's context.
    const developer = await this.userRepository.findOne({
      where: { id: developerId },
    });
    if (!developer) {
      throw new NotFoundException('Developer not found.');
    }

    // Find a store associated with the developer through their orders
    let store: StoreEntity | null = null;
    const order = await this.orderRepository.findOne({
      where: { userId: developerId },
      order: { orderDate: 'DESC' },
    });

    if (order) {
      store = await this.storeRepository.findOne({
        where: { id: order.storeId },
      });
    }

    // If no store found through orders, try to find the first store with authorized phone numbers
    // This is a fallback for testing purposes
    if (!store) {
      store = await this.storeRepository.findOne({
        where: {},
      });
    }

    if (!store) {
      throw new NotFoundException(
        'No store found. Please ensure you have at least one store in the system.',
      );
    }

    // 3. Fetch or create the conversation state for this specific web session.
    let conversationState = await this.conversationStateRepository.findOne({
      where: { userId: conversationUserId },
    });

    if (!conversationState) {
      conversationState = this.conversationStateRepository.create({
        userId: conversationUserId,
        currentState: 'initial',
        context: { language: 'he', storeId: store.id },
      });
    } else {
      conversationState.context = {
        ...conversationState.context,
        storeId: store.id,
      };
    }

    // 4. Create a temporary, request-scoped proxy of the WhatsappService.
    // This is the key to safely intercepting messages without side effects.
    const capturedResponses: Array<{ text: string; buttons: Array<{ id: string; title: string }> }> = [];
    const proxiedWhatsappService: WhatsappService = {
      ...this.whatsappService,
      sendWhatsAppMessage: async (to, text, buttons) => {
        // Instead of calling the Meta API, capture the message and buttons.
        capturedResponses.push({ text, buttons: buttons || [] });
        return Promise.resolve();
      },
    } as WhatsappService; 

    // 5. Simulate the message object that the state machine expects.
    const simulatedMessage = {
      from: conversationUserId,
      text: { body: messageText },
      type: 'text',
    };

    // 6. Process the message using the existing, unmodified state machine.
    const newState = await handleState(
      proxiedWhatsappService,
      conversationState,
      messageText.toLowerCase(),
      simulatedMessage,
    );

    // 7. Save the updated state for the next interaction.
    await this.conversationStateRepository.save(newState);

    // 8. Return the captured bot responses to the controller.
    return { responses: capturedResponses };
  }
}

