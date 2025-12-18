import { Test, TestingModule } from '@nestjs/testing';
import { MainMenuHandler } from './main-menu.handler';
import { WhatsappService } from '../whatsapp.service';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import { ManageStoreHandler } from './manage-store.handler';
import * as messageUtils from '../utils/message.utils';

describe('MainMenuHandler', () => {
  let handler: MainMenuHandler;
  let service: WhatsappService;
  let manageStoreHandler: ManageStoreHandler;

  const mockWhatsappService = {
    sendWhatsAppMessage: jest.fn(),
  };

  const mockManageStoreHandler = {
    handle: jest.fn(),
    getHandledStates: jest.fn().mockReturnValue(['manageStore_main']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MainMenuHandler,
        {
          provide: WhatsappService,
          useValue: mockWhatsappService,
        },
        {
          provide: ManageStoreHandler,
          useValue: mockManageStoreHandler,
        },
      ],
    }).compile();

    handler = module.get<MainMenuHandler>(MainMenuHandler);
    service = module.get<WhatsappService>(WhatsappService);
    manageStoreHandler = module.get<ManageStoreHandler>(ManageStoreHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('handle', () => {
    it('should handle "1" (New Order) by sending message', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'mainMenu',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendMessage');
      spy.mockResolvedValue(undefined);

      const result = await handler.handle(service, state, '1', {});

      expect(spy).toHaveBeenCalledWith(
        service,
        '123',
        'en',
        'addProduct_awaitingName',
        {},
        [],
      );
      expect(result.currentState).toBe('addProduct_awaitingName');
    });

    it('should handle "2" (Manage Store) by delegating to ManageStoreHandler', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'mainMenu',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedState = { ...state, currentState: 'manageStore_main' };
      mockManageStoreHandler.handle.mockResolvedValue(expectedState);
      
      const result = await handler.handle(service, state, '2', {});

      expect(result).toEqual(expectedState);
    });

    it('should handle "3" (Reports & Settings) by calling presentReportsAndSettingsMenu', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'mainMenu',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'presentReportsAndSettingsMenu');
      spy.mockResolvedValue({ ...state, currentState: 'reportsAndSettings' });

      const result = await handler.handle(service, state, '3', {});

      expect(spy).toHaveBeenCalledWith(service, state);
      expect(result.currentState).toBe('reportsAndSettings');
    });

    it('should handle "main_menu_4" (Reports & Settings) by calling presentReportsAndSettingsMenu', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'mainMenu',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'presentReportsAndSettingsMenu');
      spy.mockResolvedValue({ ...state, currentState: 'reportsAndSettings' });

      const result = await handler.handle(service, state, 'main_menu_4', {});

      expect(spy).toHaveBeenCalledWith(service, state);
      expect(result.currentState).toBe('reportsAndSettings');
    });

    it('should handle invalid input by sending invalid_input message', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'mainMenu',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendMessage');
      spy.mockResolvedValue(undefined);

      const result = await handler.handle(service, state, 'invalid', {});

      expect(spy).toHaveBeenCalledWith(service, '123', 'en', 'invalid_input');
      expect(result).toBe(state);
    });
  });
});
