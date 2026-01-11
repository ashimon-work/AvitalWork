import { Injectable } from '@nestjs/common';
import { MessageHandler } from '../interfaces/message-handler.interface';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import { WhatsappService } from '../whatsapp.service';
import { sendWelcomeMessage } from '../utils/message.utils';
import { getMessage } from '../helpers';

@Injectable()
export class WelcomeHandler implements MessageHandler {
  getHandledStates(): string[] {
    return ['initial', 'welcome', 'language_selection'];
  }

  async handle(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
    message: any,
  ): Promise<ConversationStateEntity> {
    const { currentState, context, userId } = state;

    switch (currentState) {
      case 'initial':
      case 'welcome':
        return await sendWelcomeMessage(service, state);
      case 'language_selection':
        return await this.handleLanguageSelection(service, state, messageText);
      default:
        return state;
    }
  }

  private async handleLanguageSelection(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const newLang = messageText === 'lang_en' ? 'en' : 'he';
    const updatedState: ConversationStateEntity = {
      ...state,
      context: { ...context, language: newLang },
      currentState: 'initial',
    };
    const languageUpdatedMessage = getMessage(newLang, 'language_updated');
    return await sendWelcomeMessage(
      service,
      updatedState,
      languageUpdatedMessage,
    );
  }
}
