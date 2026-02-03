import { Test, TestingModule } from '@nestjs/testing';
import { WelcomeHandler } from './welcome.handler';
import { WhatsappService } from '../whatsapp.service';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import * as messageUtils from '../utils/message.utils';

describe('WelcomeHandler', () => {
  let handler: WelcomeHandler;
  let service: WhatsappService;

  const mockWhatsappService = {
    sendWhatsAppMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WelcomeHandler,
        {
          provide: WhatsappService,
          useValue: mockWhatsappService,
        },
      ],
    }).compile();

    handler = module.get<WelcomeHandler>(WelcomeHandler);
    service = module.get<WhatsappService>(WhatsappService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('handle', () => {
    it('should delegate to sendWelcomeMessageHelper for initial state', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'initial',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendWelcomeMessage');
      spy.mockResolvedValue({ ...state, currentState: 'mainMenu' });

      const result = await handler.handle(service, state, 'Hi', {});

      expect(spy).toHaveBeenCalledWith(service, state);
      expect(result.currentState).toBe('mainMenu');
    });

    it('should delegate to sendWelcomeMessageHelper for welcome state', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'welcome',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendWelcomeMessage');
      spy.mockResolvedValue({ ...state, currentState: 'mainMenu' });

      const result = await handler.handle(service, state, 'Hi', {});

      expect(spy).toHaveBeenCalledWith(service, state);
      expect(result.currentState).toBe('mainMenu');
    });

    it('should handle language selection', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'language_selection',
        context: { language: 'he' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendWelcomeMessage');
      spy.mockResolvedValue({ ...state, currentState: 'mainMenu' });

      const result = await handler.handle(service, state, 'lang_en', {});

      (expect(spy) as any).toHaveBeenCalledWith(
        service,
        (expect as any).objectContaining({
          context: (expect as any).objectContaining({ language: 'en' }),
        }),
        (expect as any).anything(),
      );
    });

    it('should handle language selection for Hebrew', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'language_selection',
        context: { language: 'en' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendWelcomeMessage');
      spy.mockResolvedValue({ ...state, currentState: 'mainMenu' });

      const result = await handler.handle(service, state, 'lang_he', {});

      (expect(spy) as any).toHaveBeenCalledWith(
        service,
        (expect as any).objectContaining({
          context: (expect as any).objectContaining({ language: 'he' }),
        }),
        (expect as any).anything(),
      );
    });

    it('should default to Hebrew if selection is unknown (fallback behavior)', async () => {
      // The current implementation defaults to 'he' if not 'lang_en'.
      // Let's verify this behavior or fix it if it's wrong.
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'language_selection',
        context: { language: 'en' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendWelcomeMessage');
      spy.mockResolvedValue({ ...state, currentState: 'mainMenu' });

      const result = await handler.handle(service, state, 'invalid_lang', {});

      (expect(spy) as any).toHaveBeenCalledWith(
        service,
        (expect as any).objectContaining({
          context: (expect as any).objectContaining({ language: 'he' }),
        }),
        (expect as any).anything(),
      );
    });

    it('should preserve other context data during language switch', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'language_selection',
        context: { language: 'en', storeId: 'store_123', otherData: 'test' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendWelcomeMessage');
      spy.mockResolvedValue({ ...state, currentState: 'mainMenu' });

      const result = await handler.handle(service, state, 'lang_en', {});

      (expect(spy) as any).toHaveBeenCalledWith(
        service,
        (expect as any).objectContaining({
          context: (expect as any).objectContaining({
            language: 'en',
            storeId: 'store_123',
            otherData: 'test',
          }),
        }),
        (expect as any).anything(),
      );
    });
  });
});
