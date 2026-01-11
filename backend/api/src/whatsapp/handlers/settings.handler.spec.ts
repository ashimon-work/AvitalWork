import { Test, TestingModule } from '@nestjs/testing';
import { SettingsHandler } from './settings.handler';
import { WhatsappService } from '../whatsapp.service';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import * as messageUtils from '../utils/message.utils';

describe('SettingsHandler', () => {
  let handler: SettingsHandler;
  let service: WhatsappService;

  const mockWhatsappService = {
    sendWhatsAppMessage: jest.fn(),
    storeRepository: {
      findOne: jest.fn(),
    },
    orderRepository: {
      find: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsHandler,
        {
          provide: WhatsappService,
          useValue: mockWhatsappService,
        },
      ],
    }).compile();

    handler = module.get<SettingsHandler>(SettingsHandler);
    service = module.get<WhatsappService>(WhatsappService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('handle', () => {
    it('should handle "reports_and_settings_settings" by showing settings menu', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'reportsAndSettings',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendMessage');
      spy.mockResolvedValue(undefined);

      const result = await handler.handle(
        service,
        state,
        'reports_and_settings_settings',
        {},
      );

      expect(spy).toHaveBeenCalledWith(
        service,
        '123',
        'en',
        'settingsMenu',
        {},
        (expect as any).any(Array),
      );
      expect(result.currentState).toBe('settings');
    });

    it('should handle "reports_and_settings_reports" by showing store details', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'reportsAndSettings',
        context: { storeId: 'store1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWhatsappService.storeRepository.findOne.mockResolvedValue({
        id: 'store1',
        name: 'Test Store',
        products: [],
        categories: [],
      });
      mockWhatsappService.orderRepository.find.mockResolvedValue([]);

      const result = await handler.handle(
        service,
        state,
        'reports_and_settings_reports',
        {},
      );

      expect(mockWhatsappService.sendWhatsAppMessage).toHaveBeenCalled();
      expect(result.currentState).toBe('mainMenu');
    });

    it('should handle "switch_language" by presenting language choice', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'settings',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'presentLanguageChoice');
      spy.mockResolvedValue({ ...state, currentState: 'language_selection' });

      const result = await handler.handle(
        service,
        state,
        'switch_language',
        {},
      );

      expect(spy).toHaveBeenCalledWith(service, state);
      expect(result.currentState).toBe('language_selection');
    });

    it('should handle "reset" by sending welcome message', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'settings',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendWelcomeMessage');
      spy.mockResolvedValue({ ...state, currentState: 'mainMenu' });

      const result = await handler.handle(service, state, 'reset', {});

      expect(spy).toHaveBeenCalledWith(
        service,
        (expect as any).anything(),
        (expect as any).any(String),
      );
      expect(result.currentState).toBe('mainMenu');
    });
  });
});
