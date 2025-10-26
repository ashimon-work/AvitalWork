import { ConversationStateEntity } from './entities/conversation-state.entity';
import { ProductVariantEntity } from 'src/products/entities/product-variant.entity';
import { i18n } from './i18n';

type Language = 'en' | 'he';

// Language and input utilities
export const getLang = (state: ConversationStateEntity): Language =>
  (state.context?.language as Language) || 'en';

export const isMainMenuCommand = (text: string) =>
  ['main_menu', 'חזרה לתפריט הראשי'].includes(text);

export const isYes = (text: string) =>
  [
    'yes',
    'כן',
    'y',
    'true',
    '1',
    'add_variants_yes',
    'has_variations_yes',
  ].includes(text.toLowerCase());

export const isNo = (text: string) =>
  [
    'no',
    'לא',
    'n',
    'false',
    '0',
    'add_variants_no',
    'has_variations_no',
  ].includes(text.toLowerCase());

export const isDoneMessage = (text?: string) =>
  ['done', 'סיום'].includes((text || '').toLowerCase());

// Message utilities
export const getMessage = (
  lang: Language,
  key: keyof typeof i18n.en,
  replacements?: Record<string, string>,
) => {
  let message = i18n[lang][key] || i18n.en[key];
  if (replacements) {
    for (const placeholder in replacements) {
      if (Object.prototype.hasOwnProperty.call(replacements, placeholder)) {
        const value = replacements[placeholder];
        message = message.replace(`{${placeholder}}`, value);
      }
    }
  }
  return message;
};

// Pricing utilities
export const computeFinalPrice = (basePrice: number | string, vatPercent: number | string) => {
  const numericBasePrice = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
  const numericVatPercent = typeof vatPercent === 'string' ? parseFloat(vatPercent) : vatPercent;
  
  return Number.isFinite(numericBasePrice) && Number.isFinite(numericVatPercent) 
    ? numericBasePrice * (1 + numericVatPercent / 100) 
    : NaN;
};

// Product utilities
export const isSimpleProductByContext = (
  colors?: string[],
  sizes?: string[],
  lang: Language = 'en',
) =>
  Array.isArray(colors) &&
  colors.length === 1 &&
  colors[0] === getMessage(lang, 'no_color_default') &&
  Array.isArray(sizes) &&
  sizes.length === 1 &&
  sizes[0] === getMessage(lang, 'standard_size_default');

export const parseStockLevels = (text: string): number[] =>
  text.split(',').map((s) => parseInt(s.trim(), 10));

export const validateStockLevels = (
  levels: number[],
  expectedCount: number,
): boolean =>
  levels.length === expectedCount &&
  levels.every((n) => Number.isInteger(n) && n >= 0);

// UI utilities
export const formatNumberedList = <T>(
  items: T[],
  label: (item: T, index: number) => string,
): string =>
  items.map((item, index) => `${index + 1}. ${label(item, index)}`).join('\n');

export const summaryButtons = (mode: 'manage' | 'create', lang: Language) => {
  if (mode === 'manage') {
    return [
      { id: 'update_product', title: getMessage(lang, 'publish_button') },
      { id: 'edit', title: getMessage(lang, 'edit_button') },
      { id: 'main_menu', title: getMessage(lang, 'main_menu_button') },
    ];
  } else {
    return [
      { id: 'publish', title: getMessage(lang, 'publish_button') },
      { id: 'edit', title: getMessage(lang, 'edit_button') },
    ];
  }
};

type EditChoice =
  | 'addProduct_editName'
  | 'addProduct_editPrice'
  | 'addProduct_editDescription'
  | 'addProduct_editColors'
  | 'addProduct_editStock'
  | 'addProduct_editImages';

export const mapEditChoice = (
  choice: string,
): { nextState?: EditChoice; messageKey?: string } => {
  const map: Record<string, { nextState: EditChoice; messageKey: string }> = {
    '1': { nextState: 'addProduct_editName', messageKey: 'edit_name' },
    '2': { nextState: 'addProduct_editPrice', messageKey: 'edit_price' },
    '3': {
      nextState: 'addProduct_editDescription',
      messageKey: 'edit_description',
    },
    '4': { nextState: 'addProduct_editColors', messageKey: 'edit_colors' },
    '5': { nextState: 'addProduct_editStock', messageKey: 'edit_stock' },
    '6': { nextState: 'addProduct_editImages', messageKey: 'edit_images' },
  };
  return map[choice] || {};
};

// Variant generation utility
export const generateVariants = (
  skuBase: string,
  colors: string[],
  sizes: string[],
  stock: Record<string, number[]>,
  price: number,
) => {
  const variants: Omit<
    ProductVariantEntity,
    'id' | 'product' | 'createdAt' | 'updatedAt' | 'productId'
  >[] = [];

  colors.forEach((color) => {
    sizes.forEach((size, index) => {
      variants.push({
        sku: `${skuBase}-${color.toUpperCase()}-${size}`,
        price,
        stockLevel: stock[color]?.[index] ?? 0,
        options: [
          { name: 'Color', value: color },
          { name: 'Size', value: size },
        ],
      });
    });
  });

  return variants;
};

// Re-prompt utility
export const invalidThenPrompt = async (
  send: (
    to: string,
    message: string,
    buttons?: { id: string; title: string }[],
  ) => Promise<void>,
  to: string,
  lang: Language,
  promptKey: keyof typeof i18n.en,
  replacements?: Record<string, string>,
) => {
  await send(to, getMessage(lang, 'invalid_input'), []);
  await send(to, getMessage(lang, promptKey, replacements), []);
};
