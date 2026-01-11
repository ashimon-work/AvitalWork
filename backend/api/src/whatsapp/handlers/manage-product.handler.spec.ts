import { Test, TestingModule } from '@nestjs/testing';
import { ManageProductHandler } from './manage-product.handler';
import { WhatsappService } from '../whatsapp.service';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import * as messageUtils from '../utils/message.utils';
import * as commonUtils from '../utils/common.utils';
import * as productUtils from '../utils/product.utils';

describe('ManageProductHandler', () => {
  let handler: ManageProductHandler;
  let service: WhatsappService;

  const mockWhatsappService = {
    sendWhatsAppMessage: jest.fn(),
    productRepository: {
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    },
    categoryRepository: {
      find: jest.fn(),
      findOne: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageProductHandler,
        {
          provide: WhatsappService,
          useValue: mockWhatsappService,
        },
      ],
    }).compile();

    handler = module.get<ManageProductHandler>(ManageProductHandler);
    service = module.get<WhatsappService>(WhatsappService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('handle', () => {
    it('should handle "manageCategories_selectProduct" by listing products', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'manageCategories_selectProduct',
        context: { categoryId: 'cat1', productIds: ['prod1'] },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const products = [{ id: 'prod1', name: 'Product 1' }];
      mockWhatsappService.productRepository.find.mockResolvedValue(products);
      mockWhatsappService.productRepository.findOne.mockResolvedValue({
        id: 'prod1',
        name: 'Product 1',
        variants: [],
        categories: [{ id: 'cat1', name: 'Category 1' }],
      });
      const spy = jest.spyOn(messageUtils, 'sendMessage');
      spy.mockResolvedValue(undefined);

      const result = await handler.handle(service, state, '1', {});

      expect(spy).toHaveBeenCalledWith(
        service,
        '123',
        'en',
        'addProduct_awaitingConfirmation',
        (expect as any).anything(),
        (expect as any).anything(),
      );
      expect(result.currentState).toBe('manageProduct_selected');
    });

    it('should handle "manageProduct_selected" (Edit) by showing edit options', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'manageProduct_selected',
        context: { productId: 'prod1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const spy = jest.spyOn(messageUtils, 'sendMessage');
      spy.mockResolvedValue(undefined);

      const result = await handler.handle(
        service,
        state,
        'manage_product_edit',
        {},
      );

      expect(spy).toHaveBeenCalledWith(
        service,
        '123',
        'en',
        'addProduct_fixChoice',
        {},
        (expect as any).any(Array),
      );
      expect(result.currentState).toBe('manageProduct_editChoice');
    });

    it('should handle "manageProduct_editChoice" (Edit Name) by asking for new name', async () => {
      const state: ConversationStateEntity = {
        userId: '123',
        currentState: 'manageProduct_editChoice',
        context: { productId: 'prod1' },
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
        'edit_name',
        {
          firstColor: '',
          sizes: '',
        },
        (expect as any).any(Array),
      );
      expect(result.currentState).toBe('addProduct_editName');
    });
  });
});
