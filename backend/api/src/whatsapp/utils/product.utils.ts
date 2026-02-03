import { getMessage, computeFinalPrice } from '../helpers';

type Language = 'en' | 'he';

/**
 * Stateless function to extract common product data from context
 */
export const extractProductData = (context: any) => ({
  productName: context.productName,
  categoryId: context.categoryId,
  categoryName: context.categoryName,
  price: context.price,
  finalPrice: context.finalPrice,
  description: context.description,
  colors: context.colors || [],
  sizes: context.sizes || [],
  stock: context.stock || {},
  images: context.images || [],
  sku: context.sku,
});

/**
 * Stateless function to check if product is simple (no variations)
 */
export const isSimpleProduct = (
  colors: string[],
  sizes: string[],
  lang: Language,
): boolean => {
  const noColorDefault = getMessage(lang, 'no_color_default');
  const standardSizeDefault = getMessage(lang, 'standard_size_default');

  return (
    colors.length === 1 &&
    colors[0] === noColorDefault &&
    sizes.length === 1 &&
    sizes[0] === standardSizeDefault
  );
};

export const generateProductSummary = (context: any, lang: Language): string => {
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

  let summary = `---\n- ${getMessage(lang, 'summary_product')}: *${productName}*\n- ${getMessage(lang, 'summary_category')}: ${context.categoryName}\n- ${getMessage(lang, 'summary_price')}: *${finalPrice ? Number(finalPrice).toFixed(2) : 'N/A'} ILS* ${getMessage(lang, 'summary_vat_included')}\n- ${getMessage(lang, 'summary_description')}: ${description}\n- ${getMessage(lang, 'summary_variations_stock')}:\n`;

  // Check if this is a simple product (no variations) or has variations
  const isSimpleProduct =
    colors &&
    colors.length === 1 &&
    colors === getMessage(lang, 'no_color_default') &&
    sizes &&
    sizes.length === 1 &&
    sizes === getMessage(lang, 'standard_size_default');

  if (isSimpleProduct) {
    // Simple product - show total stock
    const totalStock = stock?.[getMessage(lang, 'no_color_default')]?.[0] ?? 0;
    summary += `- ${getMessage(lang, 'summary_stock')}: *${totalStock} units*\n`;
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
};
