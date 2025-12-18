import { Injectable } from '@nestjs/common';
import { MessageHandler } from '../interfaces/message-handler.interface';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import { WhatsappService } from '../whatsapp.service';
import { i18n } from '../i18n';
import {
  getLang,
  getMessage,
  isMainMenuCommand,
  isYes,
  isNo,
  computeFinalPrice,
  formatNumberedList,
  mapEditChoice,
  generateVariants,
} from '../helpers';
import { createStateTransition } from '../utils/common.utils';
import { sendMessage, sendWelcomeMessage } from '../utils/message.utils';
import {
  extractProductData,
  isSimpleProduct,
  generateProductSummary,
} from '../utils/product.utils';
import {
  findEntityById,
  updateProductWithVariants,
} from '../repository-helpers';

@Injectable()
export class ManageProductHandler implements MessageHandler {
  getHandledStates(): string[] {
    return [
      'manageProducts_awaitingProductSelection',
      'manageProduct_missingVariants',
      'manageProduct_selected',
      'manageProduct_editChoice',
      'manageProduct_awaitingUpdate',
      'manageCategories_selectProduct',
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
      case 'manageProducts_awaitingProductSelection':
        return this.handleProductSelection(service, state, messageText);
      case 'manageProduct_missingVariants':
        return this.handleManageProductMissingVariants(
          service,
          state,
          messageText,
        );
      case 'manageProduct_selected':
        return this.handleManageProductSelected(service, state, messageText);
      case 'manageProduct_editChoice':
        return this.handleManageProductEditChoice(service, state, messageText);
      case 'manageProduct_awaitingUpdate':
        return this.handleManageProductAwaitingUpdate(
          service,
          state,
          messageText,
        );
      case 'manageCategories_selectProduct':
        return this.handleProductSelection(service, state, messageText);
      default:
        return state;
    }
  }

  private async handleProductSelection(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = context.language || 'en';
    const productIndex = parseInt(messageText, 10) - 1;
    // Handle both productIds (from manageProducts_awaitingProductSelection) and categoryProducts (from manageCategories_selectProduct)
    const productIds = context.productIds || context.categoryProducts;
    const productId = productIds[productIndex];

    if (productId) {
      const product = await service.productRepository.findOne({
        where: { id: productId },
        relations: ['variants', 'categories'],
      });
      if (product) {
        const colors = product.variants
          .map((v) => v.options.find((o) => o.name === 'Color')?.value)
          .filter((v, i, a) => a.indexOf(v) === i && v);
        const sizes = product.variants
          .map((v) => v.options.find((o) => o.name === 'Size')?.value)
          .filter((v, i, a) => a.indexOf(v) === i && v);

        // Always generate a summary, even for products with missing variants
        let summary: string;
        const hasVariants = colors.length > 0 && sizes.length > 0;

        if (hasVariants) {
          // Product has complete variants - show full summary
          summary = generateProductSummary(
            {
              productName: product.name,
              categoryName: product.categories.map((c) => c.name).join(', '),
              finalPrice: product.variants[0]?.price || 0,
              description: product.description,
              colors: colors,
              sizes: sizes,
              stock: product.variants.reduce(
                (acc, v) => {
                  const color = v.options.find(
                    (o) => o.name === 'Color',
                  )?.value;
                  if (color) {
                    if (!acc[color]) {
                      acc[color] = [];
                    }
                    acc[color].push(v.stockLevel);
                  }
                  return acc;
                },
                {} as Record<string, number[]>,
              ),
            },
            lang,
          );
        } else {
          // Product has no variants - use product's direct price and stock
          const basicPrice = product.price || 0;
          const vatPercent = parseFloat(
            process.env.DEFAULT_VAT_PERCENT || '18',
          );
          const finalPrice = computeFinalPrice(basicPrice, vatPercent);

          summary = `---
*${getMessage(lang, 'summary_product')}:* ${product.name}
*${getMessage(lang, 'summary_category')}:* ${product.categories.map((c) => c.name).join(', ')}
*${getMessage(lang, 'summary_price')}:* ${finalPrice.toFixed(2)} ILS ${getMessage(lang, 'summary_vat_included')}
*${getMessage(lang, 'summary_description')}:* ${product.description || 'No description'}
*${getMessage(lang, 'summary_stock')}:* ${product.stockLevel || 0}

${getMessage(lang, 'summary_missing_variants_note')}
---
`;
        }

        // Always ask if they want to change something
        await sendMessage(
          service,
          userId,
          lang,
          'addProduct_awaitingConfirmation',
          { summary },
          [
            {
              id: 'manage_product_keep',
              title: getMessage(lang, 'publish_button'),
            },
            {
              id: 'manage_product_edit',
              title: getMessage(lang, 'edit_button'),
            },
            { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
          ],
        );

        return {
          ...state,
          currentState: 'manageProduct_selected',
          context: {
            ...context,
            ...product,
            productId: product.id,
            productName: product.name,
            categoryId: product.categories[0]?.id,
            categoryName: product.categories[0]?.name,
            price: product.price,
            finalPrice: product.variants[0]?.price,
            description: product.description,
            colors: colors,
            sizes: sizes,
            hasVariants: hasVariants,
          },
        };
      }
    }

    await sendMessage(service, userId, lang, 'invalid_input');
    return state;
  }

  private async handleManageProductMissingVariants(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = context.language || 'en';

    if (isYes(messageText)) {
      // User wants to add variants - proceed to colors
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingColors',
        {},
        [],
      );
      return { ...state, currentState: 'addProduct_awaitingColors' };
    } else if (isNo(messageText)) {
      // User doesn't want to add variants - go back to main menu
      await sendWelcomeMessage(service, { ...state, currentState: 'welcome' });
      return { ...state, currentState: 'mainMenu' };
    } else {
      // Invalid response - ask again
      await sendMessage(service, userId, lang, 'product_missing_variants', {}, [
        { id: 'add_variants_yes', title: getMessage(lang, 'yes_button') },
        { id: 'add_variants_no', title: getMessage(lang, 'no_button') },
      ]);
      return state;
    }
  }

  private async handleManageProductSelected(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);

    switch (messageText) {
      case 'manage_product_keep':
        await sendMessage(service, userId, lang, 'product_unchanged', {}, [
          {
            id: 'manage_another_product',
            title: getMessage(lang, 'add_another_product'),
          },
          { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
        ]);
        return { ...state, currentState: 'mainMenu' };

      case 'manage_product_edit':
        await sendMessage(
          service,
          userId,
          lang,
          'addProduct_fixChoice',
          {},
          [],
        );
        return { ...state, currentState: 'manageProduct_editChoice' };

      case 'main_menu':
      case 'חזרה לתפריט הראשי':
        return await sendWelcomeMessage(service, {
          ...state,
          currentState: 'welcome',
        });

      default:
        await sendMessage(service, userId, lang, 'invalid_input');
        return state;
    }
  }

  private async handleManageProductEditChoice(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = getLang(state);
    if (isMainMenuCommand(messageText)) {
      return await sendWelcomeMessage(service, {
        ...state,
        currentState: 'welcome',
      });
    }

    const { nextState, messageKey } = mapEditChoice(messageText);
    if (!nextState) {
      await sendMessage(service, userId, lang, 'invalid_input');
      return state;
    }

    if (nextState) {
      // For stock editing, choose the appropriate message based on whether product has variations
      let actualMessageKey: string = messageKey || 'invalid_input';
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
        return {
          ...state,
          currentState: 'addProduct_editStock',
          context: { ...state.context, colorIndex: 0 },
        };
      }
      return { ...state, currentState: nextState };
    } else {
      await sendMessage(service, userId, lang, 'invalid_input');
      return state;
    }
  }

  private async handleManageProductAwaitingUpdate(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = context.language || 'en';

    if (messageText === 'update_product') {
      const productData = extractProductData(context);
      const existingProduct = await findEntityById(
        service.productRepository,
        context.productId,
        ['variants', 'categories'],
      );

      if (!existingProduct) {
        await sendMessage(service, userId, lang, 'invalid_input');
        return state;
      }

      // Prepare updates
      const updates = {
        name: productData.productName,
        description: productData.description,
        price: productData.price,
      };

      // Prepare new variants if provided
      let newVariants;
      if (productData.colors && productData.sizes && productData.stock) {
        newVariants = generateVariants(
          existingProduct.sku,
          productData.colors,
          productData.sizes,
          productData.stock,
          productData.finalPrice,
        );
      }

      // Update product and variants
      await updateProductWithVariants(
        service.productRepository,
        service.productVariantRepository,
        context.productId,
        updates,
        newVariants
          ? newVariants.map((v) => ({
              sku: v.sku,
              price: v.price || productData.finalPrice,
              stockLevel: v.stockLevel,
              options: v.options,
            }))
          : undefined,
      );

      // Update category if changed
      if (
        productData.categoryId &&
        existingProduct.categories[0]?.id !== productData.categoryId
      ) {
        const newCategory = await findEntityById(
          service.categoryRepository,
          productData.categoryId,
        );
        if (newCategory) {
          existingProduct.categories = [newCategory];
          await service.productRepository.save(existingProduct);
        }
      }

      await sendMessage(service, userId, lang, 'product_updated', {}, [
        {
          id: 'manage_another_product',
          title: getMessage(lang, 'add_another_product'),
        },
        { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
      ]);
      return createStateTransition(state, 'mainMenu');
    } else if (messageText === 'edit') {
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_fixChoice',
        {},
        [],
      );
      return createStateTransition(state, 'manageProduct_editChoice');
    } else if (
      messageText === 'main_menu' ||
      messageText === 'חזרה לתפריט הראשי'
    ) {
      return await sendWelcomeMessage(
        service,
        createStateTransition(state, 'welcome'),
      );
    } else {
      await sendMessage(service, userId, lang, 'invalid_input');
      return state;
    }
  }
}
