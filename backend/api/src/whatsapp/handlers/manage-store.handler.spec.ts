import { Test, TestingModule } from '@nestjs/testing';
import { ManageStoreHandler } from './manage-store.handler';
import { WhatsappService } from '../whatsapp.service';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import * as messageUtils from '../utils/message.utils';

describe('ManageStoreHandler', () => {
  let handler: ManageStoreHandler;
  let service: WhatsappService;

  const mockWhatsappService = {
    sendWhatsAppMessage: jest.fn(),
    categoryRepository: {
      find: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    },
    productRepository: {
      find: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageStoreHandler,
        {
          provide: WhatsappService,
          useValue: mockWhatsappService,
        },
      ],
    }).compile();

    handler = module.get<ManageStoreHandler>(ManageStoreHandler);
    service = module.get<WhatsappService>(WhatsappService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('handle', () => {
    it('should handle "main_menu" by sending welcome message', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'manageStore_main',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendWelcomeMessage');
      spy.mockResolvedValue({ ...state, currentState: 'mainMenu' });

      const result = await handler.handle(service, state, 'main_menu', {});

      expect(spy).toHaveBeenCalledWith(service, state);
      expect(result.currentState).toBe('mainMenu');
    });

    it('should handle "1" (Add Category) by asking for category name', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'manageStore_main',
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
        'manageStore_addCategory',
        {},
        [],
      );
      expect(result.currentState).toBe('manageStore_addCategory');
    });

    it('should handle "2" (Existing Categories) by listing categories', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'manageStore_main',
        context: { storeId: 'store1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const categories = [
        { id: 'cat1', name: 'Category 1' },
        { id: 'cat2', name: 'Category 2' },
      ];
      mockWhatsappService.categoryRepository.find.mockResolvedValue(categories);
      const spy = jest.spyOn(messageUtils, 'sendMessage');
      spy.mockResolvedValue(undefined);

      const result = await handler.handle(service, state, '2', {});

      expect(spy).toHaveBeenCalledWith(
        service,
        '123',
        'en',
        'manageCategories_askCategory',
        (expect as any).objectContaining({
          categoryList: (expect as any).stringContaining('Category 1'),
        }),
        [],
      );
      expect(result.currentState).toBe('manageCategories_askCategory');
    });

    it('should handle adding a new category', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'manageStore_addCategory',
        context: { storeId: 'store1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newCategory = {
        id: 'cat3',
        name: 'New Category',
        storeId: 'store1',
      };
      mockWhatsappService.categoryRepository.save.mockResolvedValue(
        newCategory,
      );
      const spy = jest.spyOn(messageUtils, 'sendMessage');
      spy.mockResolvedValue(undefined);

      const result = await handler.handle(service, state, 'New Category', {});

      expect(mockWhatsappService.categoryRepository.save).toHaveBeenCalledWith(
        (expect as any).objectContaining({
          name: 'New Category',
          storeId: 'store1',
        }),
      );
      expect(spy).toHaveBeenCalledWith(
        service,
        '123',
        'en',
        'manageStore_categoryCreated',
        { categoryName: 'New Category' },
        (expect as any).anything(),
      );
      expect(result.currentState).toBe('manageStore_main');
    });
  });
});
