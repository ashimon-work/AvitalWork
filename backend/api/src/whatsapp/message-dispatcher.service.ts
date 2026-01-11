import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MessageHandler } from './interfaces/message-handler.interface';
import { ConversationStateEntity } from './entities/conversation-state.entity';
import { handleState } from './state-machine';
import { withNavigationHandling } from './utils/navigation.utils';
import { WelcomeHandler } from './handlers/welcome.handler';
import { MainMenuHandler } from './handlers/main-menu.handler';
import { AddProductHandler } from './handlers/add-product.handler';
import { ManageStoreHandler } from './handlers/manage-store.handler';
import { ManageProductHandler } from './handlers/manage-product.handler';
import { SettingsHandler } from './handlers/settings.handler';

@Injectable()
export class MessageDispatcher implements OnModuleInit {
  private handlers: Map<string, MessageHandler> = new Map();

  constructor(
    private moduleRef: ModuleRef,
    private welcomeHandler: WelcomeHandler,
    private mainMenuHandler: MainMenuHandler,
    private addProductHandler: AddProductHandler,
    private manageStoreHandler: ManageStoreHandler,
    private manageProductHandler: ManageProductHandler,
    private settingsHandler: SettingsHandler,
  ) {}

  onModuleInit() {
    this.registerHandler(this.welcomeHandler);
    this.registerHandler(this.mainMenuHandler);
    this.registerHandler(this.addProductHandler);
    this.registerHandler(this.manageStoreHandler);
    this.registerHandler(this.manageProductHandler);
    this.registerHandler(this.settingsHandler);
  }

  registerHandler(handler: MessageHandler) {
    const states = handler.getHandledStates();
    for (const state of states) {
      if (this.handlers.has(state)) {
        console.warn(
          `Handler for state ${state} already registered. Overwriting.`,
        );
      }
      this.handlers.set(state, handler);
    }
  }

  async dispatch(
    service: any,
    state: ConversationStateEntity,
    messageText: string,
    message: any,
  ): Promise<ConversationStateEntity> {
    const handler = this.handlers.get(state.currentState);
    if (handler) {
      return withNavigationHandling(service, state, messageText, () =>
        handler.handle(service, state, messageText, message),
      );
    }

    // Fallback to legacy state machine
    return handleState(service, state, messageText, message);
  }
}
