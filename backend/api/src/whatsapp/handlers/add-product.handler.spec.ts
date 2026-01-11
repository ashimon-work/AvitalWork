import { Test, TestingModule } from '@nestjs/testing';
import { AddProductHandler } from './add-product.handler';
import { WhatsappService } from '../whatsapp.service';
import { ConversationStateEntity } from '../entities/conversation-state.entity';

import * as messageUtils from '../utils/message.utils';
import * as commonUtils from '../utils/common.utils';
import * as productUtils from '../utils/product.utils';

describe('AddProductHandler', () => {
  let handler: AddProductHandler;
  let service: WhatsappService;

  const mockWhatsappService = {
    sendWhatsAppMessage: jest.fn(),
    categoryRepository: {
      find: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    },
    productRepository: {
      save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
    },
    productVariantRepository: {
      save: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddProductHandler,
        {
          provide: WhatsappService,
          useValue: mockWhatsappService,
        },
      ],
    }).compile();

    handler = module.get<AddProductHandler>(AddProductHandler);
    service = module.get<WhatsappService>(WhatsappService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('handle', () => {
    it('should handle "addProduct_awaitingName" by asking for category', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_awaitingName',
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const categories = [{ id: 'cat1', name: 'Category 1' }];
      mockWhatsappService.categoryRepository.find.mockResolvedValue(categories);
      const spy = jest.spyOn(messageUtils, 'sendMessage');
      spy.mockResolvedValue(undefined);

      const result = await handler.handle(service, state, 'Product Name', {});

      expect(spy).toHaveBeenCalledWith(
        service,
        '123',
        'en',
        'addProduct_awaitingCategory',
        (expect as any).anything(),
        (expect as any).anything(),
      );
      expect(result.currentState).toBe('addProduct_awaitingCategory');
    });

    it('should handle "addProduct_awaitingCategory" with new category', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_awaitingCategory',
        context: { productName: 'Product Name' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendMessage');
      spy.mockResolvedValue(undefined);
      const transitionSpy = jest.spyOn(commonUtils, 'createStateTransition');

      const result = await handler.handle(service, state, 'new', {});

      expect(spy).toHaveBeenCalledWith(
        service,
        '123',
        'en',
        'addProduct_awaitingNewCategoryName',
        {},
        [],
      );
      expect(transitionSpy).toHaveBeenCalledWith(
        state,
        'addProduct_awaitingNewCategoryName',
      );
    });

    it('should handle "addProduct_awaitingPrice" with valid price', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_awaitingPrice',
        context: { productName: 'Product Name', categoryId: 'cat1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendMessage');
      spy.mockResolvedValue(undefined);
      const validateSpy = jest.spyOn(messageUtils, 'validateAndRetry');
      validateSpy.mockResolvedValue(true);

      const result = await handler.handle(service, state, '100', {});

      expect(spy).toHaveBeenCalledWith(
        service,
        '123',
        'en',
        'addProduct_askVatInclusion',
        {},
        (expect as any).any(Array),
      );
      expect(result.currentState).toBe('addProduct_askVatInclusion');
    });

    it('should handle invalid price input', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_awaitingPrice',
        context: { productName: 'Product Name', categoryId: 'cat1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validateSpy = jest.spyOn(messageUtils, 'validateAndRetry');
      validateSpy.mockResolvedValue(false);

      const result = await handler.handle(service, state, 'invalid', {});

      expect(result.currentState).toBe('addProduct_awaitingPrice');
    });
  });

  describe('handleAskVatInclusion', () => {
    it('should handle "yes" - price includes VAT', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_askVatInclusion',
        context: {
          storeId: 'store1',
          productName: 'Test Product',
          categoryId: 'cat1',
          price: 100,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sendMessageSpy = jest
        .spyOn(messageUtils, 'sendMessage')
        .mockResolvedValue(undefined);

      const result = await handler.handle(
        service,
        state,
        'price_includes_vat_yes',
        {},
      );

      expect(result.currentState).toBe('addProduct_awaitingDescription');
      expect(result.context.finalPrice).toBe(100);
    });

    it('should handle "no" - price does not include VAT', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_askVatInclusion',
        context: {
          storeId: 'store1',
          productName: 'Test Product',
          categoryId: 'cat1',
          price: 100,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sendMessageSpy = jest
        .spyOn(messageUtils, 'sendMessage')
        .mockResolvedValue(undefined);

      const result = await handler.handle(
        service,
        state,
        'price_includes_vat_no',
        {},
      );

      expect(result.currentState).toBe('addProduct_awaitingDescription');
      expect(result.context.finalPrice).toBe(118); // 100 + 18% VAT
    });
  });

  describe('handleAwaitingDescription', () => {
    it('should handle description input and ask about variations', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_awaitingDescription',
        context: {
          storeId: 'store1',
          productName: 'Test Product',
          categoryId: 'cat1',
          price: 100,
          finalPrice: 118,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sendMessageSpy = jest
        .spyOn(messageUtils, 'sendMessage')
        .mockResolvedValue(undefined);

      const result = await handler.handle(
        service,
        state,
        'This is a test product description',
        {},
      );

      expect(result.currentState).toBe('addProduct_askVariations');
      expect(result.context.description).toBe(
        'This is a test product description',
      );
    });
  });

  describe('handleAskVariations', () => {
    it('should handle "yes" and proceed to colors', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_askVariations',
        context: {
          storeId: 'store1',
          productName: 'Test Product',
          description: 'Test description',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sendMessageSpy = jest
        .spyOn(messageUtils, 'sendMessage')
        .mockResolvedValue(undefined);

      const result = await handler.handle(
        service,
        state,
        'has_variations_yes',
        {},
      );

      expect(result.currentState).toBe('addProduct_awaitingColors');
    });

    it('should handle "no" and proceed to simple stock', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_askVariations',
        context: {
          storeId: 'store1',
          productName: 'Test Product',
          description: 'Test description',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sendMessageSpy = jest
        .spyOn(messageUtils, 'sendMessage')
        .mockResolvedValue(undefined);

      const result = await handler.handle(
        service,
        state,
        'has_variations_no',
        {},
      );

      expect(result.currentState).toBe('addProduct_awaitingSimpleStock');
    });
  });

  describe('handleAwaitingSimpleStock', () => {
    it('should handle valid stock amount', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_awaitingSimpleStock',
        context: {
          storeId: 'store1',
          productName: 'Test Product',
          language: 'en',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sendMessageSpy = jest
        .spyOn(messageUtils, 'sendMessage')
        .mockResolvedValue(undefined);

      const result = await handler.handle(service, state, '50', {});

      expect(result.currentState).toBe('addProduct_awaitingImages');
      expect(result.context.colors).toBeDefined();
      expect(result.context.sizes).toBeDefined();
      expect(result.context.stock).toBeDefined();
    });

    it('should handle invalid stock amount', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'addProduct_awaitingSimpleStock',
        context: {
          storeId: 'store1',
          productName: 'Test Product',
          language: 'en',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sendMessageSpy = jest
        .spyOn(messageUtils, 'sendMessage')
        .mockResolvedValue(undefined);

      const result = await handler.handle(service, state, 'invalid', {});

      expect(result.currentState).toBe('addProduct_awaitingSimpleStock');
    });
  });

  it('should handle "addProduct_awaitingConfirmation" with publish', async () => {
    const state: ConversationStateEntity = {
      userId: '123',
      currentState: 'addProduct_awaitingConfirmation',
      context: {
        productName: 'Product Name',
        categoryId: 'cat1',
        finalPrice: 100,
        storeId: 'store1',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const spy = jest.spyOn(messageUtils, 'sendMessage');
    spy.mockResolvedValue(undefined);
    const extractSpy = jest.spyOn(productUtils, 'extractProductData');
    extractSpy.mockReturnValue({
      productName: 'Product Name',
      categoryId: 'cat1',
      finalPrice: 100,
      price: 100,
      description: '',
      colors: [],
      sizes: [],
      stock: {},
      images: [],
      sku: 'sku',
      categoryName: 'Category 1',
    });

    const result = await handler.handle(service, state, 'publish', {});

    expect(mockWhatsappService.productRepository.save).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      service,
      '123',
      'en',
      'addProduct_publishSuccess',
      {},
      (expect as any).any(Array),
    );
    expect(result.currentState).toBe('mainMenu');
  });
});
