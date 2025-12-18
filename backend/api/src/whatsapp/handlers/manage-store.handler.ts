import { Injectable } from '@nestjs/common';
import { MessageHandler } from '../interfaces/message-handler.interface';
import { ConversationStateEntity } from '../entities/conversation-state.entity';
import { WhatsappService } from '../whatsapp.service';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { getMessage, formatNumberedList } from '../helpers';
import { sendMessage, sendWelcomeMessage } from '../utils/message.utils';



@Injectable()
export class ManageStoreHandler implements MessageHandler {
  getHandledStates(): string[] {
    return [
      'manageStore_main',
      'manageStore_addCategory',
      'manageStore_selectCategory',
      'manageStore_categoryOptions',
      'manageCategories_askCategory',
      'manageCategories_askAction',
      'manageCategories_editName',
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
      case 'manageStore_main':
        return this.handleManageStoreMain(service, state, messageText);
      case 'manageStore_addCategory':
        return this.handleManageStoreAddCategory(service, state, messageText);
      case 'manageStore_selectCategory':
        return this.handleManageStoreSelectCategory(service, state, messageText);
      case 'manageStore_categoryOptions':
        return this.handleManageStoreCategoryOptions(service, state, messageText);
      case 'manageCategories_askCategory':
      case 'manageCategories_askAction':
        return this.handleManageCategoriesAskAction(service, state, messageText);
      case 'manageCategories_editName':
        return this.handleManageCategoriesEditName(service, state, messageText);

      default:
        return state;
    }
  }

  private async handleManageStoreMain(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = context.language || 'en';

    // Handle main menu navigation
    if (messageText === 'main_menu' || messageText === 'חזרה לתפריט הראשי') {
      return await sendWelcomeMessage(service, state);
    }

    // Handle direct menu selections
    if (messageText === '1' || messageText === 'manage_store_add_category') {
      return await this.handleManageStoreAddCategory(
        service,
        state,
        'manage_store_add_category',
      );
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
  }

  private async handleManageStoreAddCategory(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
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
  }

  private async handleManageStoreSelectCategory(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
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
  }

  private async handleManageStoreCategoryOptions(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
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
        return await this.handleManageStoreSelectCategory(service, state, messageText);
      }

      const category = await service.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        await sendMessage(service, userId, lang, 'invalid_input');
        return await this.handleManageStoreSelectCategory(service, state, messageText);
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
        // Delete category
        // TODO: Implement delete category logic
        await sendMessage(service, userId, lang, 'invalid_input');
        return state;
      } else if (
        messageText === 'main_menu' ||
        messageText === 'חזרה לתפריט הראשי'
      ) {
        return await sendWelcomeMessage(service, state);
      }
    }

    await sendMessage(service, userId, lang, 'invalid_input');
    return state;
  }

  private async handleManageCategoriesAskAction(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
    const { userId, context } = state;
    const lang = context.language || 'en';

    // Check if this is a category selection (only when in askCategory state)
    if (state.currentState === 'manageCategories_askCategory' && messageText.match(/^\d+$/)) {
      const categoryIndex = parseInt(messageText, 10) - 1;
      const categoryId = context.categories[categoryIndex];

      if (!categoryId) {
        await sendMessage(service, userId, lang, 'invalid_input');
        // Return to askCategory state logic
        const categories = await service.categoryRepository.find({
          where: { storeId: context.storeId },
        });
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
          },
        };
      }

      const category = await service.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        await sendMessage(service, userId, lang, 'invalid_input');
        // Return to askCategory state logic
        const categories = await service.categoryRepository.find({
          where: { storeId: context.storeId },
        });
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
          },
        };
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
        // Redisplay category list
        const categories = await service.categoryRepository.find({
          where: { storeId: context.storeId },
        });
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
          },
        };
      }
      
      return state;
    }
  }

  private async handleManageCategoriesEditName(
    service: WhatsappService,
    state: ConversationStateEntity,
    messageText: string,
  ): Promise<ConversationStateEntity> {
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

    // Update category name
    await service.categoryRepository.update(context.selectedCategoryId, {
      name: newName,
    });

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

    return { ...state, currentState: 'manageStore_selectCategory' };
  }
}
