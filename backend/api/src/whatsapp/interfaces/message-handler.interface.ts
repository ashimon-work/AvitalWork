import { ConversationStateEntity } from '../entities/conversation-state.entity';

export interface MessageHandler {
  handle(
    service: any, // Using any to avoid circular dependency for now, or we can use an interface
    state: ConversationStateEntity,
    messageText: string,
    message: any,
  ): Promise<ConversationStateEntity>;
  getHandledStates(): string[];
}
