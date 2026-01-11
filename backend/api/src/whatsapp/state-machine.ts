import { WhatsappService } from './whatsapp.service';
import { ConversationStateEntity } from './entities/conversation-state.entity';
import { getLang } from './helpers';
import {
  sendMessage as sendMessageHelper,
  sendWelcomeMessage as sendWelcomeMessageHelper,
  presentLanguageChoice as presentLanguageChoiceHelper,
  validateAndRetry,
} from './utils/message.utils';
import { withNavigationHandling, handleListSelection } from './utils/navigation.utils';
import { createStateTransition, isMainMenuCommand } from './utils/common.utils';
import {
  extractProductData,
  isSimpleProduct,
  generateProductSummary,
} from './utils/product.utils';
import {
  getMessage,
  isYes,
  isNo,
  mapEditChoice,
  generateVariants,
  formatNumberedList,
  parseStockLevels,
  validateStockLevels,
  isDoneMessage,
  summaryButtons,
  computeFinalPrice,
} from './helpers';
import {
  findEntityById,
  createProductWithVariants,
  updateProductWithVariants,
  categoryNameExists,
} from './repository-helpers';
import { i18n } from './i18n';
import { CategoryEntity } from '../categories/entities/category.entity';

type Language = 'en' | 'he';

// Use the helper function instead of defining it here
const sendMessage = sendMessageHelper;
const sendWelcomeMessage = sendWelcomeMessageHelper;
const presentLanguageChoice = presentLanguageChoiceHelper;

export const handleState = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
  message: any,
): Promise<ConversationStateEntity> => {
  return withNavigationHandling(service, state, messageText, async () => {
    const { currentState, userId } = state;
    const lang = getLang(state);

    switch (currentState) {
      case 'initial':
      case 'welcome':
        return await sendWelcomeMessage(service, state);
      case 'language_selection':
        return await handleLanguageSelection(service, state, messageText);
      case 'mainMenu':
        return await handleMainMenu(service, state, messageText);
      case 'addProduct_awaitingName':
        return await handleAddProductAwaitingName(service, state, messageText);
      case 'addProduct_awaitingCategory':
        return await handleAddProductAwaitingCategory(
          service,
          state,
          messageText,
        );
      case 'addProduct_awaitingNewCategoryName':
        return await handleAddProductAwaitingNewCategoryName(
          service,
          state,
          messageText,
        );
      case 'addProduct_awaitingPrice':
        return await handleAddProductAwaitingPrice(service, state, messageText);
      case 'addProduct_askVatInclusion':
        return await handleAddProductAskVatInclusion(service, state, messageText);
      case 'addProduct_awaitingDescription':
        return await handleAddProductAwaitingDescription(
          service,
          state,
          messageText,
        );
      case 'addProduct_askVariations':
        return await handleAddProductAskVariations(service, state, messageText);
      case 'addProduct_awaitingSimpleStock':
        return await handleAddProductAwaitingSimpleStock(
          service,
          state,
          messageText,
        );
      case 'addProduct_awaitingColors':
        return await handleAddProductAwaitingColors(
          service,
          state,
          messageText,
        );
      case 'addProduct_awaitingSizes':
        return await handleAddProductAwaitingSizes(service, state, messageText);
      case 'addProduct_awaitingSizeStep':
        return await handleAddProductAwaitingSizeStep(
          service,
          state,
          messageText,
        );
      case 'addProduct_awaitingStock':
        return await handleAddProductAwaitingStock(service, state, messageText);
      case 'addProduct_awaitingImages':
        return await handleAddProductAwaitingImages(service, state, message);
      case 'addProduct_awaitingConfirmation':
        return await handleAddProductAwaitingConfirmation(
          service,
          state,
          messageText,
        );
      case 'addProduct_awaitingFix':
        return await handleAddProductAwaitingFix(service, state, messageText);
      case 'manageStore_main':
        return await handleManageStoreMain(service, state, messageText);
      case 'manageStore_addCategory':
        return await handleManageStoreAddCategory(service, state, messageText);
      case 'manageStore_selectCategory':
        return await handleManageStoreSelectCategory(
          service,
          state,
          messageText,
        );
      case 'manageStore_categoryOptions':
        return await handleManageStoreCategoryOptions(
          service,
          state,
          messageText,
        );
      case 'manageCategories_askCategory':
      case 'manageCategories_askAction':
        return await handleManageCategoriesAskAction(
          service,
          state,
          messageText,
        );
      case 'manageCategories_editName':
        return await handleCategoryEditName(service, state, messageText);
      case 'reportsAndSettings':
        return await handleReportsAndSettings(service, state, messageText);
      case 'addProduct_editName':
        return await handleEditName(service, state, messageText);
      case 'addProduct_editPrice':
        return await handleEditPrice(service, state, messageText);
      case 'addProduct_editPriceVatInclusion':
        return await handleEditPriceVatInclusion(service, state, messageText);
      case 'addProduct_editDescription':
        return await handleEditDescription(service, state, messageText);
      case 'addProduct_editColors':
        return await handleEditColors(service, state, messageText);
      case 'addProduct_editStock':
        return await handleEditStock(service, state, messageText);
      case 'addProduct_editImages':
        return await handleEditImages(service, state, message);
      case 'manageProducts_awaitingProductSelection':
        return await handleProductSelection(service, state, messageText);
      case 'manageCategories_selectProduct':
        return await handleProductSelection(service, state, messageText);
      case 'manageProduct_missingVariants':
        return await handleManageProductMissingVariants(
          service,
          state,
          messageText,
        );
      case 'manageProduct_selected':
        return await handleManageProductSelected(service, state, messageText);
      case 'manageProduct_editChoice':
        return await handleManageProductEditChoice(service, state, messageText);
      case 'manageProduct_awaitingUpdate':
        return await handleManageProductAwaitingUpdate(
          service,
          state,
          messageText,
        );
      case 'settings':
        return await handleSettings(service, state, messageText);
      default:
        await sendMessage(service, userId, lang, 'invalid_input');
        return state;
    }
  });
};

const handleManageProductSelected = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
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
      await sendMessage(service, userId, lang, 'addProduct_fixChoice', {}, []);
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
};

const handleManageProductEditChoice = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
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
};

const handleManageProductAwaitingUpdate = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
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
    await sendMessage(service, userId, lang, 'addProduct_fixChoice', {}, []);
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
};

const handleManageProductMissingVariants = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
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
};

const listProductsForManagement = async (
  service: WhatsappService,
  state: ConversationStateEntity,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
  const products = await service.productRepository.find({
    where: { storeId: context.storeId },
  });

  if (products.length === 0) {
    await sendMessage(service, userId, lang, 'no_products_to_manage', {}, [
      { id: 'add_new_product', title: getMessage(lang, 'add_new_product') },
      { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
    ]);
    return { ...state, currentState: 'mainMenu' };
  }

  const productList = formatNumberedList(products, (p, i) => p.name);
  await sendMessage(
    service,
    userId,
    lang,
    'select_product_to_manage',
    { productList },
    [],
  );
  return {
    ...state,
    currentState: 'manageProducts_awaitingProductSelection',
    context: { ...context, productIds: products.map((p) => p.id) },
  };
};

const handleProductSelection = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
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
                const color = v.options.find((o) => o.name === 'Color')?.value;
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
        const vatPercent = parseFloat(process.env.DEFAULT_VAT_PERCENT || '18');
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
          { id: 'manage_product_edit', title: getMessage(lang, 'edit_button') },
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
};

const handleLanguageSelection = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const newLang = messageText === 'lang_en' ? 'en' : 'he';
  const updatedState: ConversationStateEntity = {
    ...state,
    context: { ...context, language: newLang },
    currentState: 'initial',
  };
  const languageUpdatedMessage = getMessage(newLang, 'language_updated');
  return await sendWelcomeMessage(
    service,
    updatedState,
    languageUpdatedMessage,
  );
};

const handleMainMenu = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  switch (messageText) {
    case '1':
    case 'main_menu_1':
    case 'add_another_product':
      await sendMessage(
        service,
        userId,
        lang,
        'addProduct_awaitingName',
        {},
        [],
      );
      return { ...state, currentState: 'addProduct_awaitingName' };
    case '2':
    case 'main_menu_2':
      return await handleManageStoreMain(service, state, messageText);
    case '3':
    case 'main_menu_3':
    case 'main_menu_4':
      return await handleReportsAndSettings(service, state, messageText);
    case 'manage_store_add_category':
      return await handleManageStoreAddCategory(service, state, messageText);
    case 'manage_store_existing_categories':
      return await handleManageStoreSelectCategory(service, state, messageText);
    case 'manage_store_products_by_category':
      return await handleManageStoreSelectCategory(service, state, messageText);
    case 'manage_store_add_another':
      return await handleManageStoreAddCategory(service, state, messageText);
    case 'manage_store_select_category':
      return await handleManageStoreSelectCategory(service, state, messageText);
    case 'manage_store_main':
      return await handleManageStoreMain(service, state, messageText);
    case 'main_menu':
    case 'חזרה לתפריט הראשי':
      return await sendWelcomeMessage(service, state);
    default:
      await sendMessage(service, userId, lang, 'invalid_input');
      return state;
  }
};

const presentSettings = async (
  service: WhatsappService,
  state: ConversationStateEntity,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
  await sendMessage(service, userId, lang, 'settingsMenu', {}, [
    { id: 'switch_language', title: getMessage(lang, 'switch_language') },
    { id: 'reset', title: getMessage(lang, 'reset_button') },
    { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
  ]);
  return { ...state, currentState: 'settings' };
};

const handleSettings = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  switch (messageText) {
    case 'switch_language':
      return await presentLanguageChoice(service, state);
    case 'reset':
      const lang = state.context.language || 'en';
      const resetMessage = getMessage(lang, 'reset_message');
      const cleanState: ConversationStateEntity = {
        ...state,
        currentState: 'initial',
        context: { language: lang },
      };
      return await sendWelcomeMessage(service, cleanState, resetMessage);
    case 'main_menu':
    case 'חזרה לתפריט הראשי':
      return await sendWelcomeMessage(service, state);
    default:
      await sendMessage(
        service,
        state.userId,
        state.context.language || 'en',
        'invalid_input',
      );
      return state;
  }
};

const presentStoreDetails = async (
  service: WhatsappService,
  state: ConversationStateEntity,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
  const store = await service.storeRepository.findOne({
    where: { id: context.storeId },
    relations: ['products', 'categories'],
  });

  if (store) {
    const orders = await service.orderRepository.find({
      where: { storeId: store.id },
    });
    const totalRevenue = orders.reduce((sum, order) => {
      let amount = 0;
      if (typeof order.totalAmount === 'number') {
        amount = order.totalAmount;
      } else if (typeof order.totalAmount === 'string' && !isNaN(parseFloat(order.totalAmount))) {
        amount = parseFloat(order.totalAmount);
      }
      return sum + amount;
    }, 0);

    const summary = `
*${getMessage(lang, 'store_details_title')}*

*${getMessage(lang, 'store_details_name')}:* ${store.name}
*${getMessage(lang, 'store_details_description')}:* ${store.description || ''}

---

*${getMessage(lang, 'store_details_products')}:* ${store.products.length}
*${getMessage(lang, 'store_details_categories')}:* ${store.categories.length}
*${getMessage(lang, 'store_details_sales')}:* ${orders.length}
*${getMessage(lang, 'store_details_revenue')}:* ${totalRevenue.toFixed(2)} ILS
    `;
    await service.sendWhatsAppMessage(userId, summary, [
      { id: 'main_menu', title: getMessage(lang, 'back_to_main_menu') },
    ]);
    return { ...state, currentState: 'mainMenu' };
  }

  await sendMessage(service, userId, lang, 'invalid_input');
  return state;
};

const handleAddProductAwaitingName = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
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
  return {
    ...state,
    currentState: 'addProduct_awaitingCategory',
    context: {
      ...context,
      productName: messageText,
      categories: categories.map((c) => c.id),
    },
  };
};

const handleAddProductAwaitingCategory = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

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
    return handleListSelection(
      service,
      state,
      messageText,
      context.categories || [],
      async (categoryId) => {
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
      },
    );
  }
};

const handleAddProductAwaitingNewCategoryName = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
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
  return {
    ...state,
    currentState: 'addProduct_awaitingPrice',
    context: {
      ...context,
      categoryId: savedCategory.id,
      categoryName: newCategory.name,
    },
  };
};

const handleAddProductAwaitingPrice = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
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
};

const handleAddProductAskVatInclusion = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
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
};

const handleAddProductAwaitingDescription = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  await sendMessage(service, userId, lang, 'addProduct_askVariations', {}, [
    { id: 'has_variations_yes', title: getMessage(lang, 'yes_button') },
    { id: 'has_variations_no', title: getMessage(lang, 'no_button') },
  ]);
  return {
    ...state,
    currentState: 'addProduct_askVariations',
    context: { ...context, description: messageText },
  };
};

const handleAddProductAskVariations = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

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
    return { ...state, currentState: 'addProduct_awaitingColors' };
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
    return { ...state, currentState: 'addProduct_awaitingSimpleStock' };
  } else {
    // Invalid response - ask again
    await sendMessage(service, userId, lang, 'addProduct_askVariations', {}, [
      { id: 'has_variations_yes', title: getMessage(lang, 'yes_button') },
      { id: 'has_variations_no', title: getMessage(lang, 'no_button') },
    ]);
    return state;
  }
};

const handleAddProductAwaitingSimpleStock = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

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
  return {
    ...state,
    currentState: 'addProduct_awaitingImages',
    context: { ...context, colors, sizes, stock },
  };
};

const handleManageCategoriesAskCategory = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  const categories = await service.categoryRepository.find({
    where: { storeId: context.storeId },
  });

  if (categories.length === 0) {
    await sendMessage(service, userId, lang, 'no_products_to_manage', {}, [
      { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
    ]);
    return { ...state, currentState: 'mainMenu' };
  }

  const categoryList = formatNumberedList(categories, (c, i) => c.name);
  await sendMessage(
    service,
    userId,
    lang,
    'manageCategories_askCategory',
    { categoryList },
    [],
  );

  return {
    ...state,
    currentState: 'manageCategories_askCategory',
    context: { ...context, categories: categories.map((c) => c.id) },
  };
};

const handleManageCategoriesAskAction = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  // Check if this is a category selection (only when in askCategory state)
  if (state.currentState === 'manageCategories_askCategory' && messageText.match(/^\d+$/)) {
    const categoryIndex = parseInt(messageText, 10) - 1;
    const categoryId = context.categories[categoryIndex];

    if (!categoryId) {
      await sendMessage(service, userId, lang, 'invalid_input');
      return await handleManageCategoriesAskCategory(
        service,
        state,
        messageText,
      );
    }

    const category = await service.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      await sendMessage(service, userId, lang, 'invalid_input');
      return await handleManageCategoriesAskCategory(
        service,
        state,
        messageText,
      );
    }

    await sendMessage(
      service,
      userId,
      lang,
      'manageCategories_askAction',
      { categoryName: category.name },
      [
        {
          id: 'manage_category_edit_product',
          title: getMessage(lang, 'manageCategories_button_editProduct'),
        },
        {
          id: 'manage_category_edit_name',
          title: getMessage(lang, 'manageCategories_button_editName'),
        },
        { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
      ],
    );

    return {
      ...state,
      currentState: 'manageCategories_askAction',
      context: {
        ...context,
        selectedCategoryId: categoryId,
        selectedCategoryName: category.name,
      },
    };
  }

  // Handle action selection (only when in askAction state)
  if (state.currentState === 'manageCategories_askAction' && (messageText === '1' || messageText === 'manage_category_edit_product')) {
    // Edit product in category
    const products = await service.productRepository.find({
      where: { categories: { id: context.selectedCategoryId } },
      relations: ['categories'],
    });

    if (products.length === 0) {
      await sendMessage(
        service,
        userId,
        lang,
        'manageCategories_noProducts',
        {},
        [
          {
            id: 'manage_categories_again',
            title: getMessage(lang, 'manageCategories_button_askCategory'),
          },
          { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
        ],
      );
      return { ...state, currentState: 'mainMenu' };
    }

    const productList = formatNumberedList(products, (p, i) => p.name);
    await sendMessage(
      service,
      userId,
      lang,
      'manageCategories_selectProduct',
      { productList },
      [],
    );

    return {
      ...state,
      currentState: 'manageCategories_selectProduct',
      context: { ...context, categoryProducts: products.map((p) => p.id) },
    };
  } else if (
    state.currentState === 'manageCategories_askAction' && (messageText === '2' ||
    messageText === 'manage_category_edit_name')
  ) {
    // Edit category name
    await sendMessage(
      service,
      userId,
      lang,
      'manageCategories_editName',
      {},
      [],
    );
    return { ...state, currentState: 'manageCategories_editName' };
  } else if (
    messageText === 'main_menu' ||
    messageText === 'חזרה לתפריט הראשי'
  ) {
    return await sendWelcomeMessage(service, state);
  } else {
    await sendMessage(service, userId, lang, 'invalid_input');
    
    // If we're in askCategory state, return to category selection
    if (state.currentState === 'manageCategories_askCategory') {
      return await handleManageCategoriesAskCategory(service, state, messageText);
    }
    
    return state;
  }
};

const handleCategoryEditName = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  const newName = messageText.trim();
  if (!newName) {
    await sendMessage(service, userId, lang, 'invalid_input');
    await sendMessage(
      service,
      userId,
      lang,
      'manageCategories_editName',
      {},
      [],
    );
    return state;
  }
  const exists = await categoryNameExists(service.categoryRepository, newName, context.storeId);
  if (exists) {
    await sendMessage(service, userId, lang, 'manageStore_categoryExists');
    return state;
  }
  // Update category name
  console.log(
    `Updating category ${context.selectedCategoryId} name from "${context.selectedCategoryName}" to "${newName}"`,
  );
  await service.categoryRepository.update(context.selectedCategoryId, {
    name: newName,
  });
  console.log(
    `Category ${context.selectedCategoryId} successfully updated to "${newName}"`,
  );

  await sendMessage(
    service,
    userId,
    lang,
    'manageCategories_nameUpdated',
    { newName },
    [
      {
        id: 'manage_store_select_category',
        title: getMessage(lang, 'manageStore_button_selectCategory'),
      },
      { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
    ],
  );

  return { ...state, currentState: 'manageStore_main' };
};

const handleManageStoreMain = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  // Handle main menu navigation
  if (messageText === 'main_menu' || messageText === 'חזרה לתפריט הראשי') {
    return await sendWelcomeMessage(service, state);
  }

  // Handle direct menu selections
  if (messageText === '1' || messageText === 'manage_store_add_category') {
    return await handleManageStoreAddCategory(service, state, messageText);
  } else if (
    messageText === '2' ||
    messageText === 'manage_store_existing_categories'
  ) {
    // For managing existing categories, we want the full category management flow
    const categories = await service.categoryRepository.find({
      where: { storeId: context.storeId },
    });

    if (categories.length === 0) {
      await sendMessage(service, userId, lang, 'manageStore_noCategories', {}, [
        {
          id: 'manage_store_add_category',
          title: getMessage(lang, 'manageStore_button_addCategory'),
        },
        { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
      ]);
      return { ...state, currentState: 'manageStore_main' };
    }

    const categoryList = formatNumberedList(categories, (c, i) => c.name);
    await sendMessage(
      service,
      userId,
      lang,
      'manageCategories_askCategory',
      { categoryList },
      [],
    );

    return {
      ...state,
      currentState: 'manageCategories_askCategory',
      context: {
        ...context,
        categories: categories.map((c) => c.id),
        productsByCategoryMode: false, // Explicitly set to false for regular category management
      },
    };
  } else if (
    messageText === '3' ||
    messageText === 'manage_store_products_by_category'
  ) {
    // For products by category, we go directly to product management flow
    const categories = await service.categoryRepository.find({
      where: { storeId: context.storeId },
    });

    if (categories.length === 0) {
      await sendMessage(service, userId, lang, 'manageStore_noCategories', {}, [
        {
          id: 'manage_store_add_category',
          title: getMessage(lang, 'manageStore_button_addCategory'),
        },
        { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
      ]);
      return { ...state, currentState: 'manageStore_main' };
    }

    const categoryList = formatNumberedList(categories, (c, i) => c.name);
    await sendMessage(
      service,
      userId,
      lang,
      'manageStore_selectCategory',
      { categoryList },
      [],
    );

    return {
      ...state,
      currentState: 'manageStore_selectCategory',
      context: {
        ...context,
        categories: categories.map((c) => c.id),
        productsByCategoryMode: true,
      },
    };
  }

  // Show main store management menu
  // WhatsApp allows max 3 buttons. Send main 3 options as buttons
  await sendMessage(service, userId, lang, 'manageStore_menu', {}, [
    {
      id: 'manage_store_add_category',
      title: getMessage(lang, 'manageStore_button_addCategory'),
    },
    {
      id: 'manage_store_existing_categories',
      title: getMessage(lang, 'manageStore_button_existingCategories'),
    },
    {
      id: 'manage_store_products_by_category',
      title: getMessage(lang, 'manageStore_button_productsByCategory'),
    },
  ]);

  return { ...state, currentState: 'manageStore_main' };
};

const handleManageStoreAddCategory = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  // Check if this is a button click (asking for category name)
  if (
    messageText === 'manage_store_add_category' ||
    messageText === 'manage_store_add_another'
  ) {
    await sendMessage(service, userId, lang, 'manageStore_addCategory', {}, []);
    return { ...state, currentState: 'manageStore_addCategory' };
  }

  // If empty input, ask again
  if (messageText.trim() === '') {
    await sendMessage(service, userId, lang, 'invalid_input');
    await sendMessage(service, userId, lang, 'manageStore_addCategory', {}, []);
    return { ...state, currentState: 'manageStore_addCategory' };
  }

  const categoryName = messageText.trim();

  // Check if category already exists
  const existingCategory = await service.categoryRepository.findOne({
    where: { name: categoryName, storeId: context.storeId },
  });

  if (existingCategory) {
    await sendMessage(
      service,
      userId,
      lang,
      'manageStore_categoryExists',
      { categoryName },
      [
        {
          id: 'manage_store_add_category',
          title: getMessage(lang, 'manageStore_button_addCategory'),
        },
        {
          id: 'manage_store_main',
          title: getMessage(lang, 'main_menu_button'),
        },
      ],
    );
    return { ...state, currentState: 'manageStore_main' };
  }

  // Create new category
  const newCategory = new CategoryEntity();
  newCategory.name = categoryName;
  newCategory.storeId = context.storeId;

  const savedCategory = await service.categoryRepository.save(newCategory);

  await sendMessage(
    service,
    userId,
    lang,
    'manageStore_categoryCreated',
    { categoryName },
    [
      {
        id: 'manage_store_add_another',
        title: getMessage(lang, 'manageStore_button_addCategory'),
      },
      {
        id: 'manage_store_existing_categories',
        title: getMessage(lang, 'manageStore_button_existingCategories'),
      },
      { id: 'manage_store_main', title: getMessage(lang, 'main_menu_button') },
    ],
  );

  return { ...state, currentState: 'manageStore_main' };
};

const handleManageStoreSelectCategory = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  // Check if this is a category selection (numeric input)
  if (messageText.match(/^\d+$/)) {
    const categoryIndex = parseInt(messageText, 10) - 1;
    const categoryId = context.categories[categoryIndex];

    if (!categoryId) {
      await sendMessage(service, userId, lang, 'invalid_input');
      // Redisplay category list
      const categories = await service.categoryRepository.find({
        where: { storeId: context.storeId },
      });
      const categoryList = formatNumberedList(categories, (c, i) => c.name);
      await sendMessage(
        service,
        userId,
        lang,
        'manageStore_selectCategory',
        { categoryList },
        [],
      );
      return {
        ...state,
        currentState: 'manageStore_selectCategory',
        context: { ...context, categories: categories.map((c) => c.id) },
      };
    }

    const category = await service.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      await sendMessage(service, userId, lang, 'invalid_input');
      // Redisplay category list
      const categories = await service.categoryRepository.find({
        where: { storeId: context.storeId },
      });
      const categoryList = formatNumberedList(categories, (c, i) => c.name);
      await sendMessage(
        service,
        userId,
        lang,
        'manageStore_selectCategory',
        { categoryList },
        [],
      );
      return {
        ...state,
        currentState: 'manageStore_selectCategory',
        context: { ...context, categories: categories.map((c) => c.id) },
      };
    }

    // If we're in products by category mode, go directly to product selection
    if (context.productsByCategoryMode) {
      const products = await service.productRepository.find({
        where: { categories: { id: categoryId } },
        relations: ['categories'],
      });

      if (products.length === 0) {
        await sendMessage(
          service,
          userId,
          lang,
          'manageCategories_noProducts',
          {},
          [
            {
              id: 'manage_store_select_category',
              title: getMessage(lang, 'manageStore_button_selectCategory'),
            },
            {
              id: 'manage_store_main',
              title: getMessage(lang, 'main_menu_button'),
            },
          ],
        );
        return { ...state, currentState: 'manageStore_main' };
      }

      const productList = formatNumberedList(products, (p, i) => p.name);
      await sendMessage(
        service,
        userId,
        lang,
        'manageCategories_selectProduct',
        { productList },
        [],
      );

      return {
        ...state,
        currentState: 'manageCategories_selectProduct',
        context: { ...context, categoryProducts: products.map((p) => p.id) },
      };
    } else {
      // Normal category management - show options
      await sendMessage(
        service,
        userId,
        lang,
        'manageStore_categoryOptions',
        { categoryName: category.name },
        [
          {
            id: 'manage_category_edit_name',
            title: getMessage(lang, 'manageStore_button_editName'),
          },
          {
            id: 'manage_category_edit_products',
            title: getMessage(lang, 'manageStore_button_editProducts'),
          },
          {
            id: 'manage_category_delete',
            title: getMessage(lang, 'manageStore_button_deleteCategory'),
          },
        ],
      );

      return {
        ...state,
        currentState: 'manageStore_categoryOptions',
        context: {
          ...context,
          selectedCategoryId: categoryId,
          selectedCategoryName: category.name,
        },
      };
    }
  }

  // If not a number, display the category list
  const categories = await service.categoryRepository.find({
    where: { storeId: context.storeId },
  });

  if (categories.length === 0) {
    await sendMessage(service, userId, lang, 'manageStore_noCategories', {}, [
      {
        id: 'manage_store_add_category',
        title: getMessage(lang, 'manageStore_button_addCategory'),
      },
      { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
    ]);
    return { ...state, currentState: 'manageStore_main' };
  }

  const categoryList = formatNumberedList(categories, (c, i) => c.name);
  await sendMessage(
    service,
    userId,
    lang,
    'manageStore_selectCategory',
    { categoryList },
    [],
  );

  return {
    ...state,
    currentState: 'manageStore_selectCategory',
    context: { ...context, categories: categories.map((c) => c.id) },
  };
};

const handleReportsAndSettings = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  // Handle direct selections
  if (messageText === '1' || messageText === 'reports_and_settings_reports') {
    return await presentStoreDetails(service, state);
  } else if (
    messageText === '2' ||
    messageText === 'reports_and_settings_settings'
  ) {
    return await presentSettings(service, state);
  } else if (
    messageText === 'main_menu' ||
    messageText === 'חזרה לתפריט הראשי'
  ) {
    return await sendWelcomeMessage(service, state);
  }

  // Show reports and settings menu
  await sendMessage(service, userId, lang, 'reportsAndSettings_menu', {}, [
    {
      id: 'reports_and_settings_reports',
      title: getMessage(lang, 'reportsAndSettings_button_reports'),
    },
    {
      id: 'reports_and_settings_settings',
      title: getMessage(lang, 'reportsAndSettings_button_settings'),
    },
    { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
  ]);

  return { ...state, currentState: 'reportsAndSettings' };
};

const handleManageStoreCategoryOptions = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

  // Check if this is a category selection (from the category list) - only if we have categories array in context
  if (
    messageText.match(/^\d+$/) &&
    context.categories &&
    context.categories.length > 0
  ) {
    const categoryIndex = parseInt(messageText, 10) - 1;
    const categoryId = context.categories[categoryIndex];

    if (!categoryId) {
      await sendMessage(service, userId, lang, 'invalid_input');
      return await handleManageStoreSelectCategory(service, state, messageText);
    }

    const category = await service.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      await sendMessage(service, userId, lang, 'invalid_input');
      return await handleManageStoreSelectCategory(service, state, messageText);
    }

    // If we're in products by category mode, go directly to product selection
    if (context.productsByCategoryMode) {
      const products = await service.productRepository.find({
        where: { categories: { id: categoryId } },
        relations: ['categories'],
      });

      if (products.length === 0) {
        await sendMessage(
          service,
          userId,
          lang,
          'manageCategories_noProducts',
          {},
          [
            {
              id: 'manage_store_select_category',
              title: getMessage(lang, 'manageStore_button_selectCategory'),
            },
            {
              id: 'manage_store_main',
              title: getMessage(lang, 'main_menu_button'),
            },
          ],
        );
        return { ...state, currentState: 'manageStore_main' };
      }

      const productList = formatNumberedList(products, (p, i) => p.name);
      await sendMessage(
        service,
        userId,
        lang,
        'manageCategories_selectProduct',
        { productList },
        [],
      );

      return {
        ...state,
        currentState: 'manageCategories_selectProduct',
        context: { ...context, categoryProducts: products.map((p) => p.id) },
      };
    }

    // Normal category management - show options
    // WhatsApp allows max 3 buttons. Send main 3 options as buttons
    await sendMessage(
      service,
      userId,
      lang,
      'manageStore_categoryOptions',
      { categoryName: category.name },
      [
        {
          id: 'manage_category_edit_name',
          title: getMessage(lang, 'manageStore_button_editName'),
        },
        {
          id: 'manage_category_edit_products',
          title: getMessage(lang, 'manageStore_button_editProducts'),
        },
        {
          id: 'manage_category_delete',
          title: getMessage(lang, 'manageStore_button_deleteCategory'),
        },
      ],
    );

    return {
      ...state,
      currentState: 'manageStore_categoryOptions',
      context: {
        ...context,
        selectedCategoryId: categoryId,
        selectedCategoryName: category.name,
      },
    };
  }

  // Handle action selection - only if we have a selectedCategoryId (meaning we're in category options mode)
  if (context.selectedCategoryId) {
    if (messageText === '1' || messageText === 'manage_category_edit_name') {
      // Edit category name
      await sendMessage(
        service,
        userId,
        lang,
        'manageCategories_editName',
        {},
        [],
      );
      return { ...state, currentState: 'manageCategories_editName' };
    } else if (
      messageText === '2' ||
      messageText === 'manage_category_edit_products'
    ) {
      // Edit products in category
      const products = await service.productRepository.find({
        where: { categories: { id: context.selectedCategoryId } },
        relations: ['categories'],
      });

      if (products.length === 0) {
        await sendMessage(
          service,
          userId,
          lang,
          'manageCategories_noProducts',
          {},
          [
            {
              id: 'manage_store_select_category',
              title: getMessage(lang, 'manageStore_button_selectCategory'),
            },
            {
              id: 'manage_store_main',
              title: getMessage(lang, 'main_menu_button'),
            },
          ],
        );
        return { ...state, currentState: 'manageStore_main' };
      }

      const productList = formatNumberedList(products, (p, i) => p.name);
      await sendMessage(
        service,
        userId,
        lang,
        'manageCategories_selectProduct',
        { productList },
        [],
      );

      return {
        ...state,
        currentState: 'manageCategories_selectProduct',
        context: { ...context, categoryProducts: products.map((p) => p.id) },
      };
    } else if (
      messageText === '3' ||
      messageText === 'manage_category_delete'
    ) {
      // Delete category if empty
      const productsCount = await service.productRepository.count({
        where: { categories: { id: context.selectedCategoryId } },
      });

      if (productsCount > 0) {
        await sendMessage(
          service,
          userId,
          lang,
          'manageStore_categoryHasProducts',
          {},
          [
            {
              id: 'manage_store_select_category',
              title: getMessage(lang, 'manageStore_button_selectCategory'),
            },
            {
              id: 'manage_store_main',
              title: getMessage(lang, 'main_menu_button'),
            },
          ],
        );
        return { ...state, currentState: 'manageStore_main' };
      }

      await service.categoryRepository.delete(context.selectedCategoryId);
      await sendMessage(
        service,
        userId,
        lang,
        'manageStore_categoryDeleted',
        { categoryName: context.selectedCategoryName },
        [
          {
            id: 'manage_store_select_category',
            title: getMessage(lang, 'manageStore_button_selectCategory'),
          },
          {
            id: 'manage_store_main',
            title: getMessage(lang, 'main_menu_button'),
          },
        ],
      );

      return { ...state, currentState: 'manageStore_main' };
    } else if (
      messageText === 'main_menu' ||
      messageText === 'חזרה לתפריט הראשי'
    ) {
      return await sendWelcomeMessage(service, state);
    } else {
      await sendMessage(service, userId, lang, 'invalid_input');
      return state;
    }
  }

  // If we don't have categories array or selectedCategoryId, this might be an invalid state
  await sendMessage(service, userId, lang, 'invalid_input');
  return await handleManageStoreSelectCategory(service, state, messageText);
};

const handleAddProductAwaitingColors = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
  const colors = messageText.split(',').map((c) => c.trim());
  await sendMessage(service, userId, lang, 'addProduct_awaitingSizes', {}, []);
  return {
    ...state,
    currentState: 'addProduct_awaitingSizes',
    context: { ...context, colors },
  };
};

const generateSizesFromRange = (
  start: number,
  end: number,
  step: number,
): string[] => {
  const sizes: string[] = [];
  for (let size = start; size <= end; size += step) {
    sizes.push(size.toString());
  }
  return sizes;
};

const handleAddProductAwaitingSizes = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

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
      return {
        ...state,
        currentState: 'addProduct_awaitingSizeStep',
        context: { ...context, sizeRange: { start, end } },
      };
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

  const firstColor = context.colors[0]; // Use only the first color, not the entire array
  await sendMessage(
    service,
    userId,
    lang,
    'addProduct_awaitingStock',
    { firstColor, sizes: sizes.join(', ') },
    [],
  );
  return {
    ...state,
    currentState: 'addProduct_awaitingStock',
    context: { ...context, sizes, stock: {}, colorIndex: 0 },
  };
};

const handleAddProductAwaitingSizeStep = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

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
  const sizes = generateSizesFromRange(
    context.sizeRange.start,
    context.sizeRange.end,
    step,
  );

  const firstColor = context.colors[0]; // Use only the first color, not the entire array
  await sendMessage(
    service,
    userId,
    lang,
    'addProduct_awaitingStock',
    { firstColor, sizes: sizes.join(', ') },
    [],
  );
  return {
    ...state,
    currentState: 'addProduct_awaitingStock',
    context: { ...context, sizes, stock: {}, colorIndex: 0 },
  };
};

const handleAddProductAwaitingStock = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
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
    return {
      ...state,
      currentState: 'addProduct_awaitingStock',
      context: { ...context, stock: newStock, colorIndex: newColorIndex },
    };
  } else {
    await sendMessage(
      service,
      userId,
      lang,
      'addProduct_awaitingImages',
      {},
      [],
    );
    return {
      ...state,
      currentState: 'addProduct_awaitingImages',
      context: { ...context, stock: newStock, images: [] },
    };
  }
};

const handleAddProductAwaitingImages = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  message: any,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
  if (message.type === 'image') {
    const imageId = message.image.id;
    const images = [...(context.images || []), imageId];
    return { ...state, context: { ...context, images } };
  } else if (isDoneMessage(message.text?.body)) {
    const summary = generateProductSummary(context, lang);
    await sendMessage(
      service,
      userId,
      lang,
      'addProduct_awaitingConfirmation',
      { summary },
      summaryButtons('create', lang),
    );
    return { ...state, currentState: 'addProduct_awaitingConfirmation' };
  } else {
    await sendMessage(service, userId, lang, 'invalid_input');
    return state;
  }
};

const handleAddProductAwaitingConfirmation = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';

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
    return { ...state, currentState: 'addProduct_awaitingFix' };
  } else if (
    messageText === 'main_menu' ||
    messageText === 'חזרה לתפריט הראשי'
  ) {
    return await sendWelcomeMessage(service, state);
  } else {
    await sendMessage(service, userId, lang, 'invalid_input');
    return state;
  }
};

const handleAddProductAwaitingFix = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
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
    return {
      ...state,
      currentState: 'addProduct_editStock',
      context: { ...state.context, colorIndex: 0 },
    };
  }
  return { ...state, currentState: nextState };
};

const handleEditName = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const updatedState = {
    ...state,
    context: { ...state.context, productName: messageText },
  };
  return await presentSummary(service, updatedState);
};

const handleEditPrice = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
  const price = parseFloat(messageText);

  if (!isNaN(price)) {
    // Store the base price and ask if it includes VAT
    await sendMessage(service, userId, lang, 'addProduct_askVatInclusion', {}, [
      { id: 'price_includes_vat_yes', title: getMessage(lang, 'yes_button') },
      { id: 'price_includes_vat_no', title: getMessage(lang, 'no_button') },
    ]);
    return { ...state, currentState: 'addProduct_editPriceVatInclusion', context: { ...context, price } };
  } else {
    await sendMessage(service, userId, lang, 'invalid_input');
    return state;
  }
};

const handleEditPriceVatInclusion = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = context.language || 'en';
  const basePrice = context.price;

  if (isYes(messageText) || messageText === 'price_includes_vat_yes') {
    // Price already includes VAT - use as final price
    const updatedState = {
      ...state,
      context: { ...state.context, finalPrice: basePrice },
    };
    return await presentSummary(service, updatedState);
  } else if (isNo(messageText) || messageText === 'price_includes_vat_no') {
    // Price does not include VAT - calculate and add VAT
    const vatPercent = parseFloat(process.env.DEFAULT_VAT_PERCENT || '18');
    const finalPrice = computeFinalPrice(basePrice, vatPercent);
    const updatedState = {
      ...state,
      context: { ...state.context, finalPrice },
    };
    return await presentSummary(service, updatedState);
  } else {
    // Invalid response - ask again
    await sendMessage(service, userId, lang, 'addProduct_askVatInclusion', {}, [
      { id: 'price_includes_vat_yes', title: getMessage(lang, 'yes_button') },
      { id: 'price_includes_vat_no', title: getMessage(lang, 'no_button') },
    ]);
    return state;
  }
};

const handleEditDescription = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const updatedState = {
    ...state,
    context: { ...state.context, description: messageText },
  };
  return await presentSummary(service, updatedState);
};

const handleEditColors = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const colors = messageText.split(',').map((c) => c.trim());
  const updatedState = { ...state, context: { ...state.context, colors } };
  return await presentSummary(service, updatedState);
};

const handleEditStock = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  messageText: string,
): Promise<ConversationStateEntity> => {
  const { colors, sizes, colorIndex } = state.context;
  const lang = state.context.language || 'en';

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
    const updatedState = {
      ...state,
      context: { ...state.context, stock: newStock, colorIndex: 0 },
    };
    return await presentSummary(service, updatedState);
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
      return {
        ...state,
        currentState: 'addProduct_editStock',
        context: {
          ...state.context,
          stock: newStock,
          colorIndex: newColorIndex,
        },
      };
    } else {
      const updatedState = {
        ...state,
        context: { ...state.context, stock: newStock, colorIndex: 0 },
      };
      return await presentSummary(service, updatedState);
    }
  }
};

const handleEditImages = async (
  service: WhatsappService,
  state: ConversationStateEntity,
  message: any,
): Promise<ConversationStateEntity> => {
  if (message.type === 'image') {
    const imageId = message.image.id;
    const images = [...(state.context.images || []), imageId];
    return { ...state, context: { ...state.context, images } };
  } else if (isDoneMessage(message.text?.body)) {
    return await presentSummary(service, state);
  } else {
    await sendMessage(
      service,
      state.userId,
      state.context.language || 'en',
      'invalid_input',
    );
    return state;
  }
};

const presentSummary = async (
  service: WhatsappService,
  state: ConversationStateEntity,
): Promise<ConversationStateEntity> => {
  const { userId, context } = state;
  const lang = (context.language || 'en') as Language;
  const summary = generateProductSummary(context, lang);

  // Check if this is product management (has productId) or new product creation
  const isProductManagement = context.productId;

  if (isProductManagement) {
    // Product management - update existing product
    await sendMessage(
      service,
      userId,
      lang,
      'addProduct_awaitingConfirmation',
      { summary },
      summaryButtons('manage', lang),
    );
    return { ...state, currentState: 'manageProduct_awaitingUpdate' };
  } else {
    // New product creation
    await sendMessage(
      service,
      userId,
      lang,
      'addProduct_awaitingConfirmation',
      { summary },
      summaryButtons('create', lang),
    );
    return { ...state, currentState: 'addProduct_awaitingConfirmation' };
  }
};
