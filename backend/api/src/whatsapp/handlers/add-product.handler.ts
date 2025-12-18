import { Injectable } from '@nestjs/common';
import { MessageHandler } from '../interfaces/message-handler.interface';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import { WhatsappService } from '../whatsapp.service';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { i18n } from '../i18n';
import {
  getLang,
  getMessage,
  isYes,
  isNo,
  isDoneMessage,
  computeFinalPrice,
  parseStockLevels,
  validateStockLevels,
  formatNumberedList,
  summaryButtons,
  mapEditChoice,
  generateVariants,
} from '../helpers';
import { createStateTransition } from '../utils/common.utils';
import { sendMessage, validateAndRetry } from '../utils/message.utils';
import { extractProductData, isSimpleProduct } from '../utils/product.utils';
import {
  findEntityById,
  createProductWithVariants,
} from '../repository-helpers';

type Language = 'en' | 'he';

@Injectable()
export class AddProductHandler implements MessageHandler {
  getHandledStates(): string[] {
    return [
      'addProduct_awaitingName',
      'addProduct_awaitingCategory',
      'addProduct_awaitingNewCategoryName',
      'addProduct_awaitingPrice',
      'addProduct_askVatInclusion',
      'addProduct_awaitingDescription',
      'addProduct_askVariations',
      'addProduct_awaitingSimpleStock',
      'addProduct_awaitingColors',
      'addProduct_awaitingSizes',
      'addProduct_awaitingSizeStep',
      'addProduct_awaitingStock',
      'addProduct_awaitingImages',
      'addProduct_awaitingConfirmation',
      'addProduct_awaitingFix',
      'addProduct_editName',
      'addProduct_editPrice',
      'addProduct_editPriceVatInclusion',
      'addProduct_editDescription',
      'addProduct_editColors',
      'addProduct_editStock',
      'addProduct_editImages',
    ];
  }

  async handle(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
    message: any,
  ): Promise<ConversationStateEntity> {
    const { currentState } = state;

    switch (currentState) {
      case 'addProduct_awaitingName':
        return this.handleAwaitingName(service, state, messageText);
      case 'addProduct_awaitingCategory':
        return this.handleAwaitingCategory(service, state, messageText);
      case 'addProduct_awaitingNewCategoryName':
        return this.handleAwaitingNewCategoryName(service, state, messageText);
      case 'addProduct_awaitingPrice':
        return this.handleAwaitingPrice(service, state, messageText);
      case 'addProduct_askVatInclusion':
        return this.handleAskVatInclusion(service, state, messageText);
      case 'addProduct_awaitingDescription':
        return this.handleAwaitingDescription(service, state, messageText);
      case 'addProduct_askVariations':
        return this.handleAskVariations(service, state, messageText);
      case 'addProduct_awaitingSimpleStock':
        return this.handleAwaitingSimpleStock(service, state, messageText);
      case 'addProduct_awaitingColors':
        return this.handleAwaitingColors(service, state, messageText);
      case 'addProduct_awaitingSizes':
        return this.handleAwaitingSizes(service, state, messageText);
      case 'addProduct_awaitingSizeStep':
        return this.handleAwaitingSizeStep(service, state, messageText);
      case 'addProduct_awaitingStock':
        return this.handleAwaitingStock(service, state, messageText);
      case 'addProduct_awaitingImages':
        return this.handleAwaitingImages(service, state, message);
      case 'addProduct_awaitingConfirmation':
        return this.handleAwaitingConfirmation(service, state, messageText);
      case 'addProduct_awaitingFix':
        return this.handleAwaitingFix(service, state, messageText);
      case 'addProduct_editName':
        return this.handleEditName(service, state, messageText);
      case 'addProduct_editPrice':
        return this.handleEditPrice(service, state, messageText);
      case 'addProduct_editPriceVatInclusion':
        return this.handleEditPriceVatInclusion(service, state, messageText);
      case 'addProduct_editDescription':
        return this.handleEditDescription(service, state, messageText);
      case 'addProduct_editColors':
        return this.handleEditColors(service, state, messageText);
      case 'addProduct_editStock':
        return this.handleEditStock(service, state, messageText);
      case 'addProduct_editImages':
        return this.handleEditImages(service, state, message);
      default:
        return state;
    }
  }

  private async handleAwaitingName(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    const categories = await service.categoryRepository.find();
    const categoryList = formatNumberedList(categories, (c, i) => c.name);
    
    await sendMessage(
      service,
      userId,
      lang,
      'addProduct_awaitingCategory',
      { categoryList },
      [],
    );
    
    return createStateTransition(state, 'addProduct_awaitingCategory', {
      productName: messageText,
      categories: categories.map((c) => c.id),
    });
  }

  private async handleAwaitingCategory(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);

    if (
      messageText.toLowerCase() === 'new' ||
      messageText.toLowerCase() === 'חדש'
    ) {
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingNewCategoryName',
        {},
        [],
      );
      return createStateTransition(state, 'addProduct_awaitingNewCategoryName');
    } else {
      // Handle list selection
      const index = parseInt(messageText, 10) - 1;
      const categoryId = context.categories?.[index];
      
      if (!categoryId) {
        await sendMessage(service, userId, lang, 'invalid_input');
        return state;
      }

      const category = await findEntityById(
        service.categoryRepository,
        categoryId,
      );
      
      if (category) {
        await sendMessage(
          service,
          userId,
          lang,
          'addProduct_awaitingPrice',
          { categoryName: category.name },
          [],
        );
        return createStateTransition(state, 'addProduct_awaitingPrice', {
          categoryId,
          categoryName: category.name,
        });
      }
      
      await sendMessage(service, userId, lang, 'invalid_input');
      return state;
    }
  }

  private async handleAwaitingNewCategoryName(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    const newCategory = new CategoryEntity();
    newCategory.name = messageText;
    newCategory.storeId = context.storeId;
    const savedCategory = await service.categoryRepository.save(newCategory);
    
    await sendMessage(
      service,
      userId,
      lang,
      'addProduct_awaitingPrice',
      { categoryName: newCategory.name },
      [],
    );
    
    return createStateTransition(state, 'addProduct_awaitingPrice', {
      categoryId: savedCategory.id,
      categoryName: newCategory.name,
    });
  }

  private async handleAwaitingPrice(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    const price = parseFloat(messageText);

    if (
      !(await validateAndRetry(
        service,
        state,
        !isNaN(price),
        'addProduct_awaitingPrice',
        { categoryName: context.categoryName },
      ))
    ) {
      return state;
    }

    // Store the base price and ask if it includes VAT
    await sendMessage(service, userId, lang, 'addProduct_askVatInclusion', {}, [
      { id: 'price_includes_vat_yes', title: getMessage(lang, 'yes_button') },
      { id: 'price_includes_vat_no', title: getMessage(lang, 'no_button') },
    ]);
    return createStateTransition(state, 'addProduct_askVatInclusion', {
      price,
    });
  }

  private async handleAskVatInclusion(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    const basePrice = context.price;

    if (isYes(messageText) || messageText === 'price_includes_vat_yes') {
      // Price already includes VAT - use as final price
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_priceConfirmed',
        { finalPrice: basePrice.toFixed(2) },
        [],
      );
      return createStateTransition(state, 'addProduct_awaitingDescription', {
        finalPrice: basePrice,
      });
    } else if (isNo(messageText) || messageText === 'price_includes_vat_no') {
      // Price does not include VAT - calculate and add VAT
      const vatPercent = parseFloat(process.env.DEFAULT_VAT_PERCENT || '18');
      const finalPrice = computeFinalPrice(basePrice, vatPercent);
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_priceWithVat',
        { finalPrice: finalPrice.toFixed(2) },
        [],
      );
      return createStateTransition(state, 'addProduct_awaitingDescription', {
        finalPrice,
      });
    } else {
      // Invalid response - ask again
      await sendMessage(service, userId, lang, 'addProduct_askVatInclusion', {}, [
        { id: 'price_includes_vat_yes', title: getMessage(lang, 'yes_button') },
        { id: 'price_includes_vat_no', title: getMessage(lang, 'no_button') },
      ]);
      return state;
    }
  }

  private async handleAwaitingDescription(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);

    await sendMessage(service, userId, lang, 'addProduct_askVariations', {}, [
      { id: 'has_variations_yes', title: getMessage(lang, 'yes_button') },
      { id: 'has_variations_no', title: getMessage(lang, 'no_button') },
    ]);
    return createStateTransition(state, 'addProduct_askVariations', {
      description: messageText,
    });
  }

  private async handleAskVariations(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);

    if (isYes(messageText)) {
      // User wants variations - proceed to colors
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingColors',
        {},
        [],
      );
      return createStateTransition(state, 'addProduct_awaitingColors');
    } else if (isNo(messageText)) {
      // User wants simple stock - ask for stock amount
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingSimpleStock',
        {},
        [],
      );
      return createStateTransition(state, 'addProduct_awaitingSimpleStock');
    } else {
      // Invalid response - ask again
      await sendMessage(service, userId, lang, 'addProduct_askVariations', {}, [
        { id: 'has_variations_yes', title: getMessage(lang, 'yes_button') },
        { id: 'has_variations_no', title: getMessage(lang, 'no_button') },
      ]);
      return state;
    }
  }

  private async handleAwaitingSimpleStock(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);

    const stockAmount = parseInt(messageText.trim());
    if (isNaN(stockAmount) || stockAmount < 0) {
      await sendMessage(service, userId, lang, 'invalid_input');
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingSimpleStock',
        {},
        [],
      );
      return state; // Stay in same state to retry
    }

    // Set up simple product with default color and no sizes
    const colors = [getMessage(lang, 'no_color_default')];
    const sizes = [getMessage(lang, 'standard_size_default')];
    const stock = { [getMessage(lang, 'no_color_default')]: [stockAmount] };

    await sendMessage(service, userId, lang, 'addProduct_awaitingImages', {}, []);
    return createStateTransition(state, 'addProduct_awaitingImages', {
      colors,
      sizes,
      stock,
    });
  }

  private async handleAwaitingColors(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    const colors = messageText.split(',').map((c) => c.trim());
    
    await sendMessage(service, userId, lang, 'addProduct_awaitingSizes', {}, []);
    return createStateTransition(state, 'addProduct_awaitingSizes', {
      colors,
    });
  }

  private async handleAwaitingSizes(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);

    // Check if input contains a range (format: start-end)
    const rangeMatch = messageText.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);
      if (start < end) {
        await sendMessage(
          service,
          userId,
          lang,
          'addProduct_awaitingSizeStep',
          { range: messageText },
          [],
        );
        return createStateTransition(state, 'addProduct_awaitingSizeStep', {
          sizeRange: { start, end },
        });
      }
    }

    // Handle normal comma-separated sizes
    const sizes = messageText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (sizes.length === 0) {
      await sendMessage(service, userId, lang, 'invalid_input');
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingSizes',
        {},
        [],
      );
      return state; // Stay in same state to retry
    }

    const firstColor = context.colors[0];
    await sendMessage(
      service,
      userId,
      lang,
      'addProduct_awaitingStock',
      { firstColor, sizes: sizes.join(', ') },
      [],
    );
    return createStateTransition(state, 'addProduct_awaitingStock', {
      sizes,
      stock: {},
      colorIndex: 0,
    });
  }

  private async handleAwaitingSizeStep(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);

    const step = parseInt(messageText.trim());
    if (isNaN(step) || step <= 0) {
      await sendMessage(service, userId, lang, 'invalid_input');
      const range = `${context.sizeRange.start}-${context.sizeRange.end}`;
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingSizeStep',
        { range },
        [],
      );
      return state; // Stay in same state to retry
    }

    // Generate sizes from range and step
    const sizes = this.generateSizesFromRange(
      context.sizeRange.start,
      context.sizeRange.end,
      step,
    );

    const firstColor = context.colors[0];
    await sendMessage(
      service,
      userId,
      lang,
      'addProduct_awaitingStock',
      { firstColor, sizes: sizes.join(', ') },
      [],
    );
    return createStateTransition(state, 'addProduct_awaitingStock', {
      sizes,
      stock: {},
      colorIndex: 0,
    });
  }

  private generateSizesFromRange(
    start: number,
    end: number,
    step: number,
  ): string[] {
    const sizes: string[] = [];
    for (let size = start; size <= end; size += step) {
      sizes.push(size.toString());
    }
    return sizes;
  }

  private async handleAwaitingStock(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    const stockLevels = parseStockLevels(messageText);
    const currentColor = context.colors[context.colorIndex];

    // Validate that we have stock levels for all sizes
    if (!validateStockLevels(stockLevels, context.sizes.length)) {
      await sendMessage(service, userId, lang, 'invalid_input');
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingStock',
        {
          firstColor: currentColor,
          sizes: context.sizes.join(', '),
        },
        [],
      );
      return state; // Stay in same state to retry
    }

    const newStock = { ...context.stock, [currentColor]: stockLevels };
    const newColorIndex = context.colorIndex + 1;

    if (newColorIndex < context.colors.length) {
      const nextColor = context.colors[newColorIndex];
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingNextStock',
        {
          currentColor: context.colors[context.colorIndex],
          stockLevels: stockLevels.join(', '),
          nextColor,
          sizes: context.sizes.join(', '),
        },
        [],
      );
      return createStateTransition(state, 'addProduct_awaitingStock', {
        stock: newStock,
        colorIndex: newColorIndex,
      });
    } else {
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingImages',
        {},
        [],
      );
      return createStateTransition(state, 'addProduct_awaitingImages', {
        stock: newStock,
        images: [],
      });
    }
  }

  private async handleAwaitingImages(
    service: WhatsappService,
    state: ConversationStateEntity,
    message: any,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    
    if (message.type === 'image') {
      const imageId = message.image.id;
      const images = [...(context.images || []), imageId];
      return createStateTransition(state, state.currentState, { images });
    } else if (isDoneMessage(message.text?.body)) {
      const summary = this.generateProductSummary(context, lang);
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingConfirmation',
        { summary },
        summaryButtons('create', lang),
      );
      return createStateTransition(state, 'addProduct_awaitingConfirmation');
    } else {
      await sendMessage(service, userId, lang, 'invalid_input');
      return state;
    }
  }

  private async handleAwaitingConfirmation(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);

    if (messageText === 'publish') {
      const productData = extractProductData(context);
      const variants = generateVariants(
        productData.sku || `SKU-${Date.now()}`,
        productData.colors,
        productData.sizes,
        productData.stock,
        productData.finalPrice,
      );

      await createProductWithVariants(
        service.productRepository,
        service.productVariantRepository,
        service.categoryRepository,
        {
          name: productData.productName,
          description: productData.description,
          price: productData.price,
          imageUrls: productData.images,
          categoryId: productData.categoryId,
          storeId: context.storeId,
        },
        variants.map((v) => ({
          sku: v.sku,
          price: v.price || productData.finalPrice,
          stockLevel: v.stockLevel,
          options: v.options,
        })),
      );

      await sendMessage(service, userId, lang, 'addProduct_publishSuccess', {}, [
        {
          id: 'add_another_product',
          title: getMessage(lang, 'add_another_product'),
        },
        { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
      ]);
      return createStateTransition(state, 'mainMenu');
    } else if (messageText === 'edit') {
      await sendMessage(service, userId, lang, 'addProduct_fixChoice');
      return createStateTransition(state, 'addProduct_awaitingFix');
    } else {
      await sendMessage(service, userId, lang, 'invalid_input');
      return state;
    }
  }

  private async handleAwaitingFix(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    const { nextState, messageKey } = mapEditChoice(messageText);
    
    if (!nextState) {
      await sendMessage(service, userId, lang, 'invalid_input');
      return state;
    }

    // For stock editing, choose the appropriate message based on whether product has variations
    let actualMessageKey: string = messageKey || '';
    if (messageText === '5') {
      const product = await service.productRepository.findOne({
        where: { id: context.productId },
        relations: ['variants'],
      });
      const isSimpleProductCheck =
        isSimpleProduct(context.colors || [], context.sizes || [], lang) ||
        (product && product.variants.length === 0);
      actualMessageKey = isSimpleProductCheck
        ? 'edit_stock_simple'
        : 'edit_stock';
    }

    if (messageText === '5' && actualMessageKey === 'edit_stock_simple') {
      // Simple product - no parameters needed
      await sendMessage(
        service,
        userId,
        lang,
        actualMessageKey as keyof typeof i18n.en,
        {},
        [],
      );
    } else {
      await sendMessage(
        service,
        userId,
        lang,
        actualMessageKey as keyof typeof i18n.en,
        {
          firstColor: context.colors?.[0] || '',
          sizes: context.sizes?.join(', ') || '',
        },
        [],
      );
    }

    if (messageText === '5') {
      return createStateTransition(state, 'addProduct_editStock', {
        colorIndex: 0,
      });
    }
    return createStateTransition(state, nextState);
  }

  private async handleEditName(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const updatedState = createStateTransition(state, state.currentState, {
      productName: messageText,
    });
    return await this.presentSummary(service, updatedState);
  }

  private async handleEditPrice(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    const price = parseFloat(messageText);

    if (!isNaN(price)) {
      // Store the base price and ask if it includes VAT
      await sendMessage(service, userId, lang, 'addProduct_askVatInclusion', {}, [
        { id: 'price_includes_vat_yes', title: getMessage(lang, 'yes_button') },
        { id: 'price_includes_vat_no', title: getMessage(lang, 'no_button') },
      ]);
      return createStateTransition(state, 'addProduct_editPriceVatInclusion', {
        price,
      });
    } else {
      await sendMessage(service, userId, lang, 'invalid_input');
      return state;
    }
  }

  private async handleEditPriceVatInclusion(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    const basePrice = context.price;

    if (isYes(messageText) || messageText === 'price_includes_vat_yes') {
      // Price already includes VAT - use as final price
      const updatedState = createStateTransition(state, state.currentState, {
        finalPrice: basePrice,
      });
      return await this.presentSummary(service, updatedState);
    } else if (isNo(messageText) || messageText === 'price_includes_vat_no') {
      // Price does not include VAT - calculate and add VAT
      const vatPercent = parseFloat(process.env.DEFAULT_VAT_PERCENT || '18');
      const finalPrice = computeFinalPrice(basePrice, vatPercent);
      const updatedState = createStateTransition(state, state.currentState, {
        finalPrice,
      });
      return await this.presentSummary(service, updatedState);
    } else {
      // Invalid response - ask again
      await sendMessage(service, userId, lang, 'addProduct_askVatInclusion', {}, [
        { id: 'price_includes_vat_yes', title: getMessage(lang, 'yes_button') },
        { id: 'price_includes_vat_no', title: getMessage(lang, 'no_button') },
      ]);
      return state;
    }
  }

  private async handleEditDescription(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const updatedState = createStateTransition(state, state.currentState, {
      description: messageText,
    });
    return await this.presentSummary(service, updatedState);
  }

  private async handleEditColors(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const colors = messageText.split(',').map((c) => c.trim());
    const updatedState = createStateTransition(state, state.currentState, {
      colors,
    });
    return await this.presentSummary(service, updatedState);
  }

  private async handleEditStock(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { colors, sizes, colorIndex } = state.context;
    const lang = getLang(state);

    // Check if this is a simple product (no variations)
    const product = await service.productRepository.findOne({
      where: { id: state.context.productId },
      relations: ['variants'],
    });
    const isSimpleProductCheck =
      isSimpleProduct(colors || [], sizes || [], lang) ||
      (product && product.variants.length === 0);

    if (isSimpleProductCheck) {
      // Simple product - just one stock number
      const stockLevels = parseStockLevels(messageText);
      if (!validateStockLevels(stockLevels, 1)) {
        await sendMessage(service, state.userId, lang, 'invalid_input');
        await sendMessage(
          service,
          state.userId,
          lang,
          'edit_stock',
          { firstColor: colors[0], sizes: sizes.join(', ') },
          [],
        );
        return state;
      }
      const stockAmount = stockLevels[0];

      const newStock = { [getMessage(lang, 'no_color_default')]: [stockAmount] };
      const updatedState = createStateTransition(state, state.currentState, {
        stock: newStock,
        colorIndex: 0,
      });
      return await this.presentSummary(service, updatedState);
    } else {
      // Product with variations - handle multiple colors/sizes
      const stockLevels = parseStockLevels(messageText);
      const currentColor = colors[colorIndex];

      // Validate stock levels
      if (!validateStockLevels(stockLevels, sizes.length)) {
        await sendMessage(service, state.userId, lang, 'invalid_input');
        await sendMessage(
          service,
          state.userId,
          lang,
          'edit_stock',
          { firstColor: currentColor, sizes: sizes.join(', ') },
          [],
        );
        return state;
      }

      const newStock = { ...state.context.stock, [currentColor]: stockLevels };
      const newColorIndex = colorIndex + 1;

      if (newColorIndex < colors.length) {
        const nextColor = colors[newColorIndex];
        await sendMessage(
          service,
          state.userId,
          lang,
          'edit_next_stock',
          { nextColor, sizes: sizes.join(', ') },
          [],
        );
        return createStateTransition(state, 'addProduct_editStock', {
          stock: newStock,
          colorIndex: newColorIndex,
        });
      } else {
        const updatedState = createStateTransition(state, state.currentState, {
          stock: newStock,
          colorIndex: 0,
        });
        return await this.presentSummary(service, updatedState);
      }
    }
  }

  private async handleEditImages(
    service: WhatsappService,
    state: ConversationStateEntity,
    message: any,
  ): Promise<ConversationStateEntity> {
    if (message.type === 'image') {
      const imageId = message.image.id;
      const images = [...(state.context.images || []), imageId];
      return createStateTransition(state, state.currentState, { images });
    } else if (isDoneMessage(message.text?.body)) {
      return await this.presentSummary(service, state);
    } else {
      await sendMessage(
        service,
        state.userId,
        state.context.language || 'en',
        'invalid_input',
      );
      return state;
    }
  }

  private async presentSummary(
    service: WhatsappService,
    state: ConversationStateEntity,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    const summary = this.generateProductSummary(context, lang);

    // Check if this is product management (has productId) or new product creation
    const isProductManagement = context.productId;

    if (isProductManagement) {
      // Product management - return to confirmation
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingConfirmation',
        { summary },
        summaryButtons('manage', lang),
      );
      return createStateTransition(state, 'manageProduct_selected');
    } else {
      // New product creation - return to confirmation
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingConfirmation',
        { summary },
        summaryButtons('create', lang),
      );
      return createStateTransition(state, 'addProduct_awaitingConfirmation');
    }
  }

  private generateProductSummary(context: any, lang: Language): string {
    const {
      productName,
      categoryId,
      finalPrice,
      price,
      description,
      colors,
      sizes,
      stock,
    } = context;

    // Calculate final price with VAT if not provided
    let displayPrice = finalPrice;
    if (!displayPrice && price) {
      const vatPercent = parseFloat(process.env.DEFAULT_VAT_PERCENT || '18');
      displayPrice = computeFinalPrice(price, vatPercent);
    }

    let summary = `---
- ${getMessage(lang, 'summary_product')}: *${productName}*
- ${getMessage(lang, 'summary_category')}: ${context.categoryName}
- ${getMessage(lang, 'summary_price')}: *${finalPrice ? Number(finalPrice).toFixed(2) : 'N/A'} ILS* ${getMessage(lang, 'summary_vat_included')}
- ${getMessage(lang, 'summary_description')}: ${description}
- ${getMessage(lang, 'summary_variations_stock')}:
`;

    // Check if this is a simple product (no variations) or has variations
    const isSimple =
      colors &&
      colors.length === 1 &&
      colors[0] === getMessage(lang, 'no_color_default') &&
      sizes &&
      sizes.length === 1 &&
      sizes[0] === getMessage(lang, 'standard_size_default');

    if (isSimple) {
      // Simple product - show total stock
      const totalStock = stock?.[getMessage(lang, 'no_color_default')]?.[0] ?? 0;
      summary += `  - ${getMessage(lang, 'summary_stock')}: *${totalStock} units*\n`;
    } else {
      // Product with variations
      if (colors && colors.length > 0) {
        colors.forEach((color) => {
          summary += `  - ${getMessage(lang, 'summary_color')}: *${color}*\n`;
          if (sizes && sizes.length > 0) {
            sizes.forEach((size, i) => {
              const stockLevel = stock?.[color]?.[i] ?? 'N/A';
              summary += `    - ${getMessage(lang, 'summary_size')} ${size} (${getMessage(lang, 'summary_stock')}: ${stockLevel})\n`;
            });
          }
        });
      }
    }

    summary += `---`;
    return summary;
  }
}
