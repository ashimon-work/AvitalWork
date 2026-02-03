import { ConversationStateEntity } from '../entities/conversation-state.entity';

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
