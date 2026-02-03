import { Injectable } from '@nestjs/common';
import { MessageHandler } from '../interfaces/message-handler.interface';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import { WhatsappService } from '../whatsapp.service';
import { getMessage } from '../helpers';
import {
  sendMessage,
  sendWelcomeMessage,
  presentReportsAndSettingsMenu,
  presentLanguageChoice,
} from '../utils/message.utils';
import { withNavigationHandling } from '../utils/navigation.utils';

@Injectable()
export class SettingsHandler implements MessageHandler {
  getHandledStates(): string[] {
    return ['settings', 'reportsAndSettings'];
  }

  async handle(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
    message: any,
  ): Promise<ConversationStateEntity> {
    const { currentState } = state;

    switch (currentState) {
      case 'settings':
        return this.handleSettings(service, state, messageText);
      case 'reportsAndSettings':
        return this.handleReportsAndSettings(service, state, messageText);
      default:
        return state;
    }
  }

  private async handleSettings(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    switch (messageText) {
      case 'switch_language':
        return await presentLanguageChoice(service, state);
      case 'reset':
        const lang = state.context.language || 'en';
        const resetMessage = getMessage(lang, 'reset_message');
        const cleanState: ConversationStateEntity = {
          ...state,
          currentState: 'initial',
          context: { language: lang },
        };
        return await sendWelcomeMessage(service, cleanState, resetMessage);
      case 'main_menu':
      case 'חזרה לתפריט הראשי':
        return await sendWelcomeMessage(service, state);
      default:
        await sendMessage(
          service,
          state.userId,
          state.context.language || 'en',
          'invalid_input',
        );
        return state;
    }
  }

  private async handleReportsAndSettings(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = context.language || 'en';

    // Handle direct selections
    if (messageText === '1' || messageText === 'reports_and_settings_reports') {
      return await this.presentStoreDetails(service, state);
    } else if (
      messageText === '2' ||
      messageText === 'reports_and_settings_settings'
    ) {
      return await this.presentSettings(service, state);
    } else if (
      messageText === 'main_menu' ||
      messageText === 'חזרה לתפריט הראשי'
    ) {
      return await sendWelcomeMessage(service, state);
    }

    // Show reports and settings menu
    await sendMessage(service, userId, lang, 'reportsAndSettings_menu', {}, [
      {
        id: 'reports_and_settings_reports',
        title: getMessage(lang, 'reportsAndSettings_button_reports'),
      },
      {
        id: 'reports_and_settings_settings',
        title: getMessage(lang, 'reportsAndSettings_button_settings'),
      },
      { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
    ]);

    return { ...state, currentState: 'reportsAndSettings' };
  }

  private async presentSettings(
    service: WhatsappService,
    state: ConversationStateEntity,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = context.language || 'en';
    await sendMessage(service, userId, lang, 'settingsMenu', {}, [
      { id: 'switch_language', title: getMessage(lang, 'switch_language') },
      { id: 'reset', title: getMessage(lang, 'reset_button') },
      { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
    ]);
    return { ...state, currentState: 'settings' };
  }

  private async presentStoreDetails(
    service: WhatsappService,
    state: ConversationStateEntity,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = context.language || 'en';
    const store = await service.storeRepository.findOne({
      where: { id: context.storeId },
      relations: ['products', 'categories'],
    });

    if (store) {
      const orders = await service.orderRepository.find({
        where: { storeId: store.id },
      });
      const totalRevenue = orders.reduce((sum, order) => {
        let amount = 0;
        if (typeof order.totalAmount === 'number') {
          amount = order.totalAmount;
        } else if (
          typeof order.totalAmount === 'string' &&
          !isNaN(parseFloat(order.totalAmount))
        ) {
          amount = parseFloat(order.totalAmount);
        }
        return sum + amount;
      }, 0);

      const summary = `
*${getMessage(lang, 'store_details_title')}*

*${getMessage(lang, 'store_details_name')}:* ${store.name}
*${getMessage(lang, 'store_details_description')}:* ${store.description || ''}

---

*${getMessage(lang, 'store_details_products')}:* ${store.products.length}
*${getMessage(lang, 'store_details_categories')}:* ${store.categories.length}
*${getMessage(lang, 'store_details_sales')}:* ${orders.length}
*${getMessage(lang, 'store_details_revenue')}:* ${totalRevenue.toFixed(2)} ILS
    `;
      await service.sendWhatsAppMessage(userId, summary, [
        { id: 'main_menu', title: getMessage(lang, 'back_to_main_menu') },
      ]);
      return { ...state, currentState: 'mainMenu' };
    }

    await sendMessage(service, userId, lang, 'invalid_input');
    return state;
  }
}
