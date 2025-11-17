import { StoreEntity } from '../stores/entities/store.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { AboutContentEntity } from '../stores/entities/about-content.entity';
import { TestimonialEntity } from '../stores/entities/testimonial.entity';
import { FaqEntity } from '../contact/entities/faq.entity';
import { CarouselItem } from '../carousel/entities/carousel.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AddressEntity } from '../addresses/entities/address.entity';
import {
  OrderEntity,
  OrderStatus,
  PaymentStatus,
} from '../orders/entities/order.entity';
import { OrderItemEntity } from '../orders/entities/order-item.entity';
import { WishlistEntity } from '../wishlist/entities/wishlist.entity';
import { WishlistItemEntity } from '../wishlist/entities/wishlist-item.entity';
import { ReviewEntity } from '../reviews/entities/review.entity';
import { PromoCodeEntity } from '../promo-codes/entities/promo-code.entity';
import { ProductVariantOptionDto } from '../products/dto/product-variant-option.dto';

// --- Raw Data Interfaces ---
interface RawStoreData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  authorizedPhoneNumbers?: string[];
}

interface RawCategoryData {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  storeId: string;
}

interface RawProductVariantData {
  sku: string;
  options: ProductVariantOptionDto[];
  price?: number;
  stockLevel: number;
  imageUrl?: string;
}

interface RawProductData {
  id?: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  categoryIds: string[];
  tags?: string[];
  options?: string[];
  stockLevel: number;
  isActive: boolean;
  storeId: string;
  variants?: RawProductVariantData[];
}

interface RawAboutContentData {
  storeId: string;
  title: string;
  content: string;
  imageUrl?: string;
}

interface RawTestimonialData {
  storeId: string;
  author: string;
  quote: string;
  date: Date;
  rating: number;
}

interface RawFaqData {
  storeId: string;
  question: string;
  answer: string;
}

interface RawCarouselItemData {
  imageUrl: string;
  altText: string;
  linkUrl?: string;
  storeId: string;
}

interface RawUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: ('customer' | 'manager' | 'admin')[];
  passwordHash: string;
  profilePictureUrl?: string;
  phone?: string;
}

interface RawAddressData {
  id?: string;
  userId: string;
  fullName: string;
  street1: string;
  street2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

interface RawOrderItemData {
  productId: string;
  variantId?: string;
  quantity: number;
  pricePerUnit: number;
  productName: string;
  variantDetails?: string;
}

interface RawOrderData {
  id?: string;
  orderReference: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddressId: string;
  shippingMethod: string;
  trackingNumber?: string;
  items: RawOrderItemData[];
  orderDate?: Date;
}

interface RawWishlistItemData {
  productId: string;
}

interface RawWishlistData {
  id?: string;
  userId: string;
  storeId: string;
  items: RawWishlistItemData[];
}

interface RawReviewData {
  id?: string;
  productId: string;
  userId: string;
  storeId: string;
  rating: number;
  comment?: string;
}

interface RawPromoCodeData {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  validFrom?: Date;
  validTo?: Date;
  minCartValue?: number;
  storeId?: string;
}

// --- Data Definitions ---

export const LUXURY_JEWELRY_STORE_ID = 'f0000002-2222-2222-2222-000000000002';

export const luxuryJewelryStoreData: RawStoreData = {
  id: LUXURY_JEWELRY_STORE_ID,
  name: 'Luxury Jewels',
  slug: 'luxury-jewelry',
  description: 'יוקרה ואלגנטיות בכל תכשיט',
  logoUrl: 'https://picsum.photos/seed/luxury-jewels-logo/150/50',
  authorizedPhoneNumbers: ['+972583215251', '+972534758922', '+972506105590'],
};

export const luxuryJewelryCategoryData: RawCategoryData[] = [
  {
    id: 'f000000c-eeee-2222-2222-000000000001',
    name: 'טבעות יוקרה',
    description: 'טבעות יוקרתיות מזהב ויהלומים',
    imageUrl: 'https://picsum.photos/seed/luxury-rings/300/200',
    storeId: LUXURY_JEWELRY_STORE_ID,
  },
  {
    id: 'f000000c-ffff-2222-2222-000000000002',
    name: 'שרשראות יוקרה',
    description: 'שרשראות מעוצבות מחומרים יוקרתיים',
    imageUrl: 'https://picsum.photos/seed/luxury-necklaces/300/200',
    storeId: LUXURY_JEWELRY_STORE_ID,
  },
  {
    id: 'f000000c-a1b2-2222-2222-000000000003',
    name: 'עגילי יוקרה',
    description: 'עגילים אלגנטיים מזהב ואבנים יקרות',
    imageUrl: 'https://picsum.photos/seed/luxury-earrings/300/200',
    storeId: LUXURY_JEWELRY_STORE_ID,
  },
  {
    id: 'f000000c-c3d4-2222-2222-000000000004',
    name: 'צמידי יוקרה',
    description: 'צמידים יוקרתיים מעוצבים במיוחד',
    imageUrl: 'https://picsum.photos/seed/luxury-bracelets/300/200',
    storeId: LUXURY_JEWELRY_STORE_ID,
  },
  {
    id: 'f000000c-e5f6-2222-2222-000000000005',
    name: 'שעוני יוקרה',
    description: 'שעונים יוקרתיים ממותגים',
    imageUrl: 'https://picsum.photos/seed/luxury-watches/300/200',
    storeId: LUXURY_JEWELRY_STORE_ID,
  },
];

export const luxuryJewelryProductData: RawProductData[] = [
  // Luxury Rings
  {
    sku: 'LJ-RNG-001',
    name: 'טבעת יהלום סוליטר',
    description: 'טבעת זהב לבן 18 קראט עם יהלום סוליטר מרהיב, משקל 0.5 קראט',
    price: 15990.0,
    imageUrls: [
      'https://picsum.photos/seed/diamond-solitaire-ring/500/500',
      'https://picsum.photos/seed/diamond-ring-side/500/500',
    ],
    tags: ['טבעת', 'יהלום', 'זהב לבן', 'אירוסין', 'יוקרה'],
    stockLevel: 3,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[0].id],
  },
  {
    sku: 'LJ-RNG-002',
    name: 'טבעת זהב צהוב עם אבני חן',
    description: 'טבעת זהב צהוב 18 קראט משובצת אבני רובי וספיר',
    price: 8990.0,
    imageUrls: [
      'https://picsum.photos/seed/gold-ruby-ring/500/500',
    ],
    tags: ['טבעת', 'אבני חן', 'זהב צהוב', 'רובי', 'ספיר'],
    stockLevel: 2,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[0].id],
  },
  {
    sku: 'LJ-RNG-003',
    name: 'טבעת פלטינה עם יהלומים',
    description: 'טבעת פלטינה משובצת 12 יהלומים קטנים, עיצוב אלגנטי',
    price: 12500.0,
    imageUrls: [
      'https://picsum.photos/seed/platinum-diamond-ring/500/500',
    ],
    tags: ['טבעת', 'פלטינה', 'יהלומים', 'אלגנטי'],
    stockLevel: 1,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[0].id],
  },

  // Luxury Necklaces
  {
    sku: 'LJ-NCK-001',
    name: 'שרשרת זהב לבן עם תליון יהלום',
    description: 'שרשרת זהב לבן 18 קראט עם תליון יהלום מרהיב, אורך 45 ס"מ',
    price: 18990.0,
    imageUrls: [
      'https://picsum.photos/seed/gold-diamond-necklace/500/500',
      'https://picsum.photos/seed/diamond-pendant-detail/500/500',
    ],
    tags: ['שרשרת', 'יהלום', 'זהב לבן', 'תליון', 'יוקרה'],
    stockLevel: 2,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[1].id],
  },
  {
    sku: 'LJ-NCK-002',
    name: 'שרשרת פנינים מפוארת',
    description: 'שרשרת פנינים טהירות מדרום ים, אורך 50 ס"מ',
    price: 6990.0,
    imageUrls: [
      'https://picsum.photos/seed/pearl-necklace/500/500',
    ],
    tags: ['שרשרת', 'פנינים', 'אלגנטי', 'קלאסי'],
    stockLevel: 4,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[1].id],
  },
  {
    sku: 'LJ-NCK-003',
    name: 'שרשרת זהב עם אבני חן צבעוניות',
    description: 'שרשרת זהב צהוב 18 קראט עם אבני חן צבעוניות בצבעי קשת',
    price: 9290.0,
    imageUrls: [
      'https://picsum.photos/seed/colored-gemstone-necklace/500/500',
    ],
    tags: ['שרשרת', 'אבני חן', 'צבעוני', 'זהב צהוב'],
    stockLevel: 3,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[1].id],
  },

  // Luxury Earrings
  {
    sku: 'LJ-EAR-001',
    name: 'עגילי יהלום תלויים',
    description: 'עגילי זהב לבן 18 קראט עם יהלומים תלויים, עיצוב מרהיב',
    price: 7990.0,
    imageUrls: [
      'https://picsum.photos/seed/diamond-drop-earrings/500/500',
    ],
    tags: ['עגילים', 'יהלום', 'זהב לבן', 'תלויים'],
    stockLevel: 5,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[2].id],
  },
  {
    sku: 'LJ-EAR-002',
    name: 'עגילי זהב עם אבני ספיר',
    description: 'עגילי זהב צהוב 18 קראט עם אבני ספיר כחולות',
    price: 4590.0,
    imageUrls: [
      'https://picsum.photos/seed/sapphire-gold-earrings/500/500',
    ],
    tags: ['עגילים', 'ספיר', 'זהב צהוב', 'כחול'],
    stockLevel: 6,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[2].id],
  },
  {
    sku: 'LJ-EAR-003',
    name: 'עגילי פנינים ויהלומים',
    description: 'עגילים משובצים פנינים טהירות ויהלומים קטנים',
    price: 5290.0,
    imageUrls: [
      'https://picsum.photos/seed/pearl-diamond-earrings/500/500',
    ],
    tags: ['עגילים', 'פנינים', 'יהלומים', 'אלגנטי'],
    stockLevel: 4,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[2].id],
  },

  // Luxury Bracelets
  {
    sku: 'LJ-BRC-001',
    name: 'צמיד זהב עם יהלומים',
    description: 'צמיד זהב לבן 18 קראט משובץ יהלומים קטנים',
    price: 11990.0,
    imageUrls: [
      'https://picsum.photos/seed/gold-diamond-bracelet/500/500',
    ],
    tags: ['צמיד', 'יהלומים', 'זהב לבן', 'יוקרה'],
    stockLevel: 2,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[3].id],
  },
  {
    sku: 'LJ-BRC-002',
    name: 'צמיד פלטינה פשוט',
    description: 'צמיד פלטינה עיצוב קלאסי ואלגנטי',
    price: 8990.0,
    imageUrls: [
      'https://picsum.photos/seed/platinum-bracelet/500/500',
    ],
    tags: ['צמיד', 'פלטינה', 'קלאסי', 'אלגנטי'],
    stockLevel: 3,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[3].id],
  },
  {
    sku: 'LJ-BRC-003',
    name: 'צמיד זהב עם אבני חן',
    description: 'צמיד זהב צהוב 18 קראט עם אבני חן צבעוניות',
    price: 7290.0,
    imageUrls: [
      'https://picsum.photos/seed/gemstone-bracelet/500/500',
    ],
    tags: ['צמיד', 'אבני חן', 'זהב צהוב', 'צבעוני'],
    stockLevel: 4,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[3].id],
  },

  // Luxury Watches
  {
    sku: 'LJ-WCH-001',
    name: 'שעון רולקס דגם סאבמרינר',
    description: 'שעון רולקס סאבמרינר אוטומטי, עמיד למים עד 300 מטר',
    price: 45990.0,
    imageUrls: [
      'https://picsum.photos/seed/rolex-submariner/500/500',
      'https://picsum.photos/seed/rolex-submariner-detail/500/500',
    ],
    tags: ['שעון', 'רולקס', 'אוטומטי', 'עמיד מים'],
    stockLevel: 1,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[4].id],
  },
  {
    sku: 'LJ-WCH-002',
    name: 'שעון קרטייה טנק',
    description: 'שעון קרטייה טנק קלאסי, מכני ידני',
    price: 32990.0,
    imageUrls: [
      'https://picsum.photos/seed/cartier-tank/500/500',
    ],
    tags: ['שעון', 'קרטייה', 'קלאסי', 'מכני'],
    stockLevel: 2,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[4].id],
  },
  {
    sku: 'LJ-WCH-003',
    name: 'שעון אומגה סימסטר',
    description: 'שעון אומגה סימסטר כרונוגרף אוטומטי',
    price: 28990.0,
    imageUrls: [
      'https://picsum.photos/seed/omega-seamaster/500/500',
    ],
    tags: ['שעון', 'אומגה', 'כרונוגרף', 'אוטומטי'],
    stockLevel: 1,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    categoryIds: [luxuryJewelryCategoryData[4].id],
  },
];

export const luxuryJewelryAboutContentData: RawAboutContentData = {
  storeId: LUXURY_JEWELRY_STORE_ID,
  title: 'אודות Luxury Jewels',
  content: 'Luxury Jewels היא בוטיק יוקרתי המתמחה בתכשיטים ושעונים יוקרתיים. אנו מציעים מבחר קפדני של מוצרים מהמותגים המובילים בעולם, עם דגש על איכות, אלגנטיות ושירות אישי לכל לקוח. כל פריט בקולקציה שלנו נבחר בקפידה כדי להבטיח את הסטנדרטים הגבוהים ביותר של יוקרה ואיכות.',
  imageUrl: 'https://picsum.photos/seed/luxury-jewelry-store/800/400',
};

export const luxuryJewelryTestimonialData: RawTestimonialData[] = [
  {
    storeId: LUXURY_JEWELRY_STORE_ID,
    author: 'דניאל מלכה',
    quote: 'שירות מעולה ומוצרים מרהיבים. קניתי טבעת אירוסים והיא מדהימה!',
    date: new Date('2025-05-15'),
    rating: 5,
  },
  {
    storeId: LUXURY_JEWELRY_STORE_ID,
    author: 'שרה כהן',
    quote: 'הבוטיק היוקרתי הטוב ביותר שביקרתי בו. איכות ומקצועיות ברמה אחרת.',
    date: new Date('2025-04-20'),
    rating: 5,
  },
  {
    storeId: LUXURY_JEWELRY_STORE_ID,
    author: 'משה לוי',
    quote: 'שעון הרולקס שרכשתי הוא מקורי ובמחיר הוגן. מומלץ בחום!',
    date: new Date('2025-03-10'),
    rating: 5,
  },
];

export const luxuryJewelryFaqData: RawFaqData[] = [
  {
    storeId: LUXURY_JEWELRY_STORE_ID,
    question: 'האם כל התכשיטים מקוריים?',
    answer: 'כן, כל התכשיטים והשעונים שלנו מקוריים ומגיעים עם תעודת אותנטיות.',
  },
  {
    storeId: LUXURY_JEWELRY_STORE_ID,
    question: 'מהי מדיניות ההחזרות?',
    answer: 'ניתן להחזיר פריטים תוך 14 יום מהרכישה בתנאי שהם לא נעשו בהם שימוש ובמצבם המקורי.',
  },
  {
    storeId: LUXURY_JEWELRY_STORE_ID,
    question: 'האם יש שירות לקוחות אישי?',
    answer: 'כן, אנו מציעים שירות לקוחות אישי וייעוץ מקצועי לכל לקוח.',
  },
  {
    storeId: LUXURY_JEWELRY_STORE_ID,
    question: 'האם יש אחריות על המוצרים?',
    answer: 'כן, כל המוצרים מגיעים עם אחריות יצרן מלאה ושירות לאחר המכירה.',
  },
];

export const luxuryJewelryCarouselItemData: RawCarouselItemData[] = [
  {
    imageUrl: 'https://picsum.photos/seed/luxury-diamond-ring/1920/400',
    altText: 'טבעת יהלום סוליטר',
    linkUrl: `product_sku:LJ-RNG-001`,
    storeId: LUXURY_JEWELRY_STORE_ID,
  },
  {
    imageUrl: 'https://picsum.photos/seed/luxury-gold-necklace/1920/400',
    altText: 'שרשרת זהב יוקרתית',
    linkUrl: `product_sku:LJ-NCK-001`,
    storeId: LUXURY_JEWELRY_STORE_ID,
  },
  {
    imageUrl: 'https://picsum.photos/seed/luxury-rolex-watch/1920/400',
    altText: 'שעון רולקס יוקרתי',
    linkUrl: `product_sku:LJ-WCH-001`,
    storeId: LUXURY_JEWELRY_STORE_ID,
  },
  {
    imageUrl: 'https://picsum.photos/seed/luxury-bracelet/1920/400',
    altText: 'צמיד זהב עם יהלומים',
    linkUrl: `product_sku:LJ-BRC-001`,
    storeId: LUXURY_JEWELRY_STORE_ID,
  },
];

const LJ_USER_ID_1 = 'f1010000-eeee-2222-2222-000000000001';
const LJ_USER_ID_2 = 'f1010000-ffff-2222-2222-000000000002';
const LJ_MANAGER_USER_ID = 'f1010000-a1b2-2222-2222-000000000003';
const LJ_ADDRESS_ID_1 = 'f1020000-eeee-2222-2222-000000000001';
const LJ_ADDRESS_ID_2 = 'f1020000-ffff-2222-2222-000000000002';

export const luxuryJewelryUserData: RawUserData[] = [
  {
    id: LJ_USER_ID_1,
    email: 'dani.malka@example.co.il',
    firstName: 'דניאל',
    lastName: 'מלכה',
    roles: ['customer'],
    passwordHash: 'bcrypt_hashed_password_placeholder_for_luxury_jewelry',
    profilePictureUrl: 'https://picsum.photos/seed/dani.malka/200/200',
  },
  {
    id: LJ_USER_ID_2,
    email: 'sarah.cohen@example.co.il',
    firstName: 'שרה',
    lastName: 'כהן',
    roles: ['customer'],
    passwordHash: 'bcrypt_hashed_password_placeholder_for_luxury_jewelry',
    profilePictureUrl: 'https://picsum.photos/seed/sarah.cohen/200/200',
  },
  {
    id: LJ_MANAGER_USER_ID,
    email: 'manager.luxury@example.co.il',
    firstName: 'מנהל',
    lastName: 'יוקרה',
    roles: ['manager', 'customer'],
    passwordHash: 'bcrypt_hashed_password_placeholder_for_luxury_jewelry',
    profilePictureUrl: 'https://picsum.photos/seed/manager.luxury/200/200',
  },
];

export const luxuryJewelryAddressData: RawAddressData[] = [
  {
    id: LJ_ADDRESS_ID_1,
    userId: LJ_USER_ID_1,
    fullName: 'דניאל מלכה',
    street1: 'רחוב דיזנגוף 15',
    city: 'תל אביב',
    postalCode: '6433204',
    country: 'IL',
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
  {
    id: LJ_ADDRESS_ID_2,
    userId: LJ_USER_ID_2,
    fullName: 'שרה כהן',
    street1: 'שדרות בן גוריון 100',
    city: 'תל אביב',
    postalCode: '6380313',
    country: 'IL',
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
];

// Orders for Luxury Jewelry
const ljProductForOrder1 = luxuryJewelryProductData.find(p => p.sku === 'LJ-RNG-001');
const ljProductForOrder2 = luxuryJewelryProductData.find(p => p.sku === 'LJ-NCK-001');

const ljOrderItems1: RawOrderItemData[] = [];
if (ljProductForOrder1) {
  ljOrderItems1.push({
    productId: ljProductForOrder1.sku,
    quantity: 1,
    pricePerUnit: ljProductForOrder1.price,
    productName: ljProductForOrder1.name,
  });
}
if (ljProductForOrder2) {
  ljOrderItems1.push({
    productId: ljProductForOrder2.sku,
    quantity: 1,
    pricePerUnit: ljProductForOrder2.price,
    productName: ljProductForOrder2.name,
  });
}

export const luxuryJewelryOrderData: RawOrderData[] = [];
if (ljProductForOrder1 && ljProductForOrder2 && ljOrderItems1.length === 2) {
  const subtotal = ljOrderItems1.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  const shippingCost = 50.0;
  const taxRate = 0.17;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + shippingCost + taxAmount;

  luxuryJewelryOrderData.push({
    id: 'f1030000-eeee-2222-2222-000000000001',
    orderReference: `LJ-ORD-${Date.now()}-001`,
    userId: LJ_USER_ID_1,
    storeId: LUXURY_JEWELRY_STORE_ID,
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
    shippingAddressId: LJ_ADDRESS_ID_1,
    shippingMethod: 'משלוח מובטח',
    trackingNumber: 'LJTRK987654321',
    items: ljOrderItems1,
    orderDate: new Date('2025-05-20T10:00:00Z'),
  });
}

// Wishlist for Luxury Jewelry
const ljProductForWishlist = luxuryJewelryProductData.find(p => p.sku === 'LJ-WCH-001');
export const luxuryJewelryWishlistData: RawWishlistData[] = [];
if (ljProductForWishlist) {
  luxuryJewelryWishlistData.push({
    id: 'f1040000-eeee-2222-2222-000000000001',
    userId: LJ_USER_ID_2,
    storeId: LUXURY_JEWELRY_STORE_ID,
    items: [{ productId: ljProductForWishlist.sku }],
  });
}

// Reviews for Luxury Jewelry
const ljProductForReview = luxuryJewelryProductData.find(p => p.sku === 'LJ-BRC-001');
export const luxuryJewelryReviewData: RawReviewData[] = [];
if (ljProductForReview) {
  luxuryJewelryReviewData.push(
    {
      id: 'f1050000-eeee-2222-2222-000000000001',
      productId: ljProductForReview.sku,
      userId: LJ_USER_ID_1,
      storeId: LUXURY_JEWELRY_STORE_ID,
      rating: 5,
      comment: 'צמיד מדהים! איכות מעולה ועיצוב יוקרתי. שווה כל שקל!',
    },
    {
      id: 'f1050000-ffff-2222-2222-000000000002',
      productId: ljProductForReview.sku,
      userId: LJ_USER_ID_2,
      storeId: LUXURY_JEWELRY_STORE_ID,
      rating: 5,
      comment: 'קניתי את הצמיד כמתנה לאשתי והיא התאהבה. מוצר יוקרתי באמת.',
    },
  );
}

export const luxuryJewelryPromoCodeData: RawPromoCodeData[] = [
  {
    id: 'f1060000-eeee-2222-2222-000000000001',
    code: 'LUXURY10',
    discountType: 'percentage',
    discountValue: 10,
    isActive: true,
    storeId: LUXURY_JEWELRY_STORE_ID,
    validTo: new Date('2025-12-31'),
  },
  {
    id: 'f1060000-ffff-2222-2222-000000000002',
    code: 'VIP500',
    discountType: 'fixed',
    discountValue: 500,
    isActive: true,
    minCartValue: 5000,
    storeId: LUXURY_JEWELRY_STORE_ID,
  },
];
