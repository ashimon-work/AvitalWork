import { WhatsappService } from '../whatsapp.service';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import { getLang, getMessage } from '../helpers';
import {
  isLanguageSwitchCommand,
  isResetCommand,
  isMainMenuCommand,
  createStateTransition,
  validateListSelection,
} from './common.utils';
import {
  presentLanguageChoice,
  sendWelcomeMessage,
  sendMessage,
} from './message.utils';

/**
 * Higher-order function to handle common navigation commands
 */
export const withNavigationHandling = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
  handler: () => Promise<ConversationStateEntity>,
): Promise<ConversationStateEntity> => {
  if (isLanguageSwitchCommand(messageText)) {
    return await presentLanguageChoice(service, state);
  }

  if (isResetCommand(messageText)) {
    const lang = getLang(state);
    const resetMessage = getMessage(lang, 'reset_message');
    const cleanState = createStateTransition(state, 'initial', {
      language: lang,
    });
    return await sendWelcomeMessage(service, cleanState, resetMessage);
  }

  if (isMainMenuCommand(messageText)) {
    return await sendWelcomeMessage(service, state);
  }

  return handler();
};

/**
 * Reusable function for handling list selections
 */
export const handleListSelection = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
  itemIds: string[],
  onValidSelection: (
    selectedId: string,
    index: number,
  ) => Promise<ConversationStateEntity>,
  onInvalidSelection?: () => Promise<ConversationStateEntity>,
): Promise<ConversationStateEntity> => {
  const { isValid, selectedId, index } = validateListSelection(
    messageText,
    itemIds,
  );

  if (!isValid || !selectedId || index === undefined) {
    const lang = getLang(state);
    await sendMessage(service, state.userId, lang, 'invalid_input');
    return onInvalidSelection ? await onInvalidSelection() : state;
  }

  return onValidSelection(selectedId, index);
};
