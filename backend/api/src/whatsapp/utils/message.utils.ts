import { WhatsappService } from '../whatsapp.service';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import { getMessage, getLang } from '../helpers';
import { i18n } from '../i18n';
import { createStateTransition } from './common.utils';

type Language = 'en' | 'he';

/**
 * Reusable function for sending messages with standard buttons
 */
export const sendMessage = async (
  service: WhatsappService,
  to: string,
  lang: Language,
  key: keyof typeof i18n.en,
  replacements?: Record<string, string>,
  buttons?: { id: string; title: string }[],
): Promise<void> => {
  const message = getMessage(lang, key, replacements);

  let finalButtons = buttons;
  if (!buttons || buttons.length === 0) {
    finalButtons = [
      { id: 'switch_language', title: getMessage(lang, 'switch_language') },
      { id: 'reset', title: getMessage(lang, 'reset_button') },
    ];
  }

  await service.sendWhatsAppMessage(to, message, finalButtons);
};

/**
 * Reusable function for sending welcome message
 */
export const sendWelcomeMessage = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  prefix = '',
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
  const welcome = getMessage(lang, 'welcome');

  if (prefix) {
    await service.sendWhatsAppMessage(userId, prefix);
  }

  const menuItems = getMessage(lang, 'mainMenu').split('\n');
  const menuOptions = menuItems.map((item, index) => ({
    id: `main_menu_${index + 1}`,
    title: item,
  }));

  const buttonOptions = menuOptions.slice(0, 2);
  buttonOptions.push({
    id: 'main_menu_4',
    title: getMessage(lang, 'settingsMenu'),
  });

  await service.sendWhatsAppMessage(userId, welcome, buttonOptions);

  return createStateTransition(state, 'mainMenu');
};

/**
 * Reusable function for presenting language choice
 */
export const presentLanguageChoice = async (
  service: WhatsappService,
  state: ConversationStateEntity,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  await sendMessage(service, userId, lang, 'language_selection', {}, [
    { id: 'lang_en', title: 'English' },
    { id: 'lang_he', title: 'עברית' },
  ]);

  return createStateTransition(state, 'language_selection', {
    previousState: state.currentState,
  });
};

/**
 * Helper to validate and send error message with retry
 */
export const validateAndRetry = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  isValid: boolean,
  retryMessageKey: keyof typeof i18n.en,
  retryParams?: Record<string, string>,
): Promise<boolean> => {
  if (!isValid) {
    const lang = getLang(state);
    await sendMessage(service, state.userId, lang, 'invalid_input');
    await sendMessage(
      service,
      state.userId,
      lang,
      retryMessageKey,
      retryParams,
      [],
    );
    return false;
  }
  return true;
};

/**
 * Reusable function for presenting Reports & Settings menu
 */
export const presentReportsAndSettingsMenu = async (
  service: WhatsappService,
  state: ConversationStateEntity,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

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

  return createStateTransition(state, 'reportsAndSettings');
};
