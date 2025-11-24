import { WhatsappService } from './whatsapp.service';
import { ConversationStateEntity } from './entities/conversation-state.entity';
import { getMessage, getLang } from './helpers';
import { i18n } from './i18n';

type Language = 'en' | 'he';
type StateTransition = {
  nextState: string;
  context?: Record<string, any>;
};

/**
 * Stateless helper to create state transitions
 */
export const createStateTransition = (
  state: ConversationStateEntity,
  nextState: string,
  contextUpdates?: Record<string, any>,
): ConversationStateEntity => ({
  ...state,
  currentState: nextState,
  context: { ...state.context, ...contextUpdates },
});

/**
 * Stateless helper to validate numeric selection from a list
 */
export const validateListSelection = (
  messageText: string,
  itemIds: string[],
): { isValid: boolean; selectedId?: string; index?: number } => {
  const index = parseInt(messageText, 10) - 1;
  if (isNaN(index) || index < 0 || index >= itemIds.length) {
    return { isValid: false };
  }
  return { isValid: true, selectedId: itemIds[index], index };
};

/**
 * Stateless helper to check if message is a main menu command
 */
export const isMainMenuCommand = (messageText: string): boolean => {
  return messageText === 'main_menu' || messageText === 'חזרה לתפריט הראשי';
};

/**
 * Stateless helper to check if message is a reset command
 */
export const isResetCommand = (messageText: string): boolean => {
  return messageText === 'reset' || messageText === 'איפוס';
};

/**
 * Stateless helper to check if message is a language switch command
 */
export const isLanguageSwitchCommand = (messageText: string): boolean => {
  return messageText === 'switch_language';
};

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
 * Stateless function to extract common product data from context
 */
export const extractProductData = (context: any) => ({
  productName: context.productName,
  categoryId: context.categoryId,
  categoryName: context.categoryName,
  price: context.price,
  finalPrice: context.finalPrice,
  description: context.description,
  colors: context.colors || [],
  sizes: context.sizes || [],
  stock: context.stock || {},
  images: context.images || [],
  sku: context.sku,
});

/**
 * Stateless function to check if product is simple (no variations)
 */
export const isSimpleProduct = (
  colors: string[],
  sizes: string[],
  lang: Language,
): boolean => {
  const noColorDefault = getMessage(lang, 'no_color_default');
  const standardSizeDefault = getMessage(lang, 'standard_size_default');

  return (
    colors.length === 1 &&
    colors[0] === noColorDefault &&
    sizes.length === 1 &&
    sizes[0] === standardSizeDefault
  );
};

