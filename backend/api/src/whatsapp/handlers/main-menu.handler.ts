import { Injectable } from '@nestjs/common';
import { MessageHandler } from '../interfaces/message-handler.interface';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import { WhatsappService } from '../whatsapp.service';
import {
  sendMessage,
  sendWelcomeMessage,
  presentReportsAndSettingsMenu,
} from '../utils/message.utils';
import { withNavigationHandling } from '../utils/navigation.utils';
import { ManageStoreHandler } from './manage-store.handler';

@Injectable()
export class MainMenuHandler implements MessageHandler {
  constructor(private readonly manageStoreHandler: ManageStoreHandler) {}

  getHandledStates(): string[] {
    return ['mainMenu'];
  }

  async handle(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
    message: any,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = context.language || 'en';

    switch (messageText) {
      case '1':
      case 'main_menu_1':
      case 'add_another_product':
        await sendMessage(
          service,
          userId,
          lang,
          'addProduct_awaitingName',
          {},
          [],
        );
        return { ...state, currentState: 'addProduct_awaitingName' };
      case '2':
      case 'main_menu_2':
        // Delegate to ManageStoreHandler
        return await this.manageStoreHandler.handle(
          service,
          { ...state, currentState: 'manageStore_main' },
          messageText,
          message,
        );
      case '3':
      case 'main_menu_3':
      case 'main_menu_4':
        return await presentReportsAndSettingsMenu(service, state);
      case 'manage_store_add_category':
      case 'manage_store_existing_categories':
      case 'manage_store_products_by_category':
      case 'manage_store_add_another':
      case 'manage_store_select_category':
      case 'manage_store_main':
        // These seem to be buttons that might be clicked while in Main Menu (if state got desynced?)
        // Or maybe they are just handled here for robustness.
        // We can delegate them to ManageStoreHandler as well, setting the appropriate state if needed.
        // For now, let's assume they map to manageStore_main state logic.
        return await this.manageStoreHandler.handle(
          service,
          { ...state, currentState: 'manageStore_main' },
          messageText,
          message,
        );
      case 'main_menu':
      case 'חזרה לתפריט הראשי':
        return await sendWelcomeMessage(service, state);
      default:
        await sendMessage(service, userId, lang, 'invalid_input');
        return state;
    }
  }
}
