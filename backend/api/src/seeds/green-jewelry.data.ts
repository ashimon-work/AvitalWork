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
  id?: string; // Optional for products if SKUs are primary for lookup before creation
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
  linkUrl?: string; // Will store product SKU like "product_sku:GJ-RNG-001"
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
  productId: string; // Reference by ID (or SKU if resolved during seeding)
  variantId?: string; // Reference by ID (or SKU)
  quantity: number;
  pricePerUnit: number;
  productName: string; // Snapshot
  variantDetails?: string; // Snapshot
}

interface RawOrderData {
  id?: string; // Optional for seeding
  orderReference: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddressId: string; // ID of an address from RawAddressData
  shippingMethod: string;
  trackingNumber?: string;
  items: RawOrderItemData[];
  orderDate?: Date;
}

interface RawWishlistItemData {
  productId: string; // Reference by ID (or SKU)
}

interface RawWishlistData {
  id?: string; // Optional for seeding
  userId: string;
  storeId: string;
  items: RawWishlistItemData[];
}

interface RawReviewData {
  id?: string; // Optional for seeding
  productId: string; // Reference by ID (or SKU)
  userId: string;
  storeId: string;
  rating: number;
  comment?: string;
}

interface RawPromoCodeData {
  id?: string; // Optional for seeding
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

export const GREEN_JEWELRY_STORE_ID = 'f0000001-1111-1111-1111-000000000001';

export const greenJewelryStoreData: RawStoreData = {
  id: GREEN_JEWELRY_STORE_ID,
  name: 'תכשיטי גרין',
  slug: 'green-jewelry',
  description: 'להתרגש כול יום מחדש', // This can be used for AboutContent
  logoUrl:
    'https://greenjewelry.co.il/wp-content/uploads/2024/09/cropped-green-logo.png', // Using existing logo from about content as placeholder
  authorizedPhoneNumbers: ['+972583215251', '+972534758922', '+972506105590'],
};

export const greenJewelryCategoryData: RawCategoryData[] = [
  {
    id: 'f000000c-aaaa-1111-1111-000000000001',
    name: 'טבעות',
    description: 'מבחר טבעות מיוחדות',
    imageUrl:
      'https://greenjewelry.co.il/wp-content/uploads/2024/10/ללא-שם-800-x-1400-פיקסל-585x1024.png',
    storeId: GREEN_JEWELRY_STORE_ID,
  },
  {
    id: 'f000000c-bbbb-1111-1111-000000000002',
    name: 'עגילים',
    description: 'קולקציית עגילים מרהיבה',
    imageUrl:
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/D7AAD79ED795D7A0D794-D7A9D79C-WhatsApp_-2024-08-06-D791D7A9D7A2D794-10.37.47_f965afec-768x1024.jpg',
    storeId: GREEN_JEWELRY_STORE_ID,
  },
  {
    id: 'f000000c-cccc-1111-1111-000000000003',
    name: 'צמידים',
    description: 'צמידים אופנתיים לכל אירוע',
    imageUrl:
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/Whitagram-Image32-770x1024.jpg',
    storeId: GREEN_JEWELRY_STORE_ID,
  },
  {
    id: 'f000000c-dddd-1111-1111-000000000004',
    name: 'שרשראות',
    description: 'שרשראות מעוצבות וייחודיות',
    imageUrl:
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/woman-wearing-diamond-necklace-ring-1024x683.jpg',
    storeId: GREEN_JEWELRY_STORE_ID,
  },
];

export const greenJewelryProductData: RawProductData[] = [
  // Rings
  {
    sku: 'GJ-RNG-001',
    name: 'טבעת גבע כסף',
    description: 'טבעת גבע כסף יפהפיה, מק"ט JSI082',
    price: 99.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/R5048-600x600.jpg',
    ],
    tags: ['טבעת', 'כסף', 'גבע'],
    stockLevel: 20,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'GJ-RNG-002',
    name: 'טבעת גאפ פליז',
    description: 'טבעת גאפ פליז בעיצוב מודרני, מק"ט LO0179-2-2',
    price: 189.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1693393238_5f060d6feecb30e653af43eda9e3d7b9-1-600x600.jpg',
    ],
    tags: ['טבעת', 'פליז', 'גאפ'],
    stockLevel: 15,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  // Earrings
  {
    sku: 'GJ-EAR-001',
    name: 'זוג עגילי חמסה צמודים כסף אמיתי',
    description: 'עגילי חמסה מכסף אמיתי להגנה וסטייל, מק"ט KSI3025-1',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716289605_721967842501-300x300-1-2.jpg',
    ],
    tags: ['עגיל', 'כסף', 'חמסה', 'צמודים'],
    stockLevel: 25,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  // Bracelets
  {
    sku: 'GJ-BRC-001',
    name: 'צמיד טניס משובץ כסף אמיתי',
    description: 'צמיד טניס קלאסי משובץ כסף אמיתי, מק"ט ZSI2003-1',
    price: 619.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1713351933_721967841030-scaled-1-600x600.jpg',
    ],
    tags: ['צמיד', 'כסף', 'טניס', 'משובץ'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  // Necklaces
  {
    sku: 'GJ-NCK-001',
    name: 'שרשרת טיפה אבן טורקיז',
    description: 'שרשרת עדינה עם תליון טיפה ואבן טורקיז, מק"ט LSI8001-1',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725452900_PJ9B4511-scaled-1-600x600.jpg',
    ],
    tags: ['שרשרת', 'טורקיז', 'טיפה'],
    stockLevel: 18,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: 'JSI082',
    name: 'טבעת גבע כסף',
    description: 'טבעת גבע כסף, מק"ט JSI082',
    price: 99.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/R5048-600x600.jpg',
    ],
    tags: ['טבעת', 'גבע', 'כסף'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'LSI8001-1',
    name: 'שרשרת טיפה אבן טורקיז',
    description: 'שרשרת טיפה אבן טורקיז, מק"ט LSI8001-1',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725452900_PJ9B4511-scaled-1-600x600.jpg',
    ],
    tags: ['שרשרת', 'טיפה', 'אבן', 'טורקיז'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: 'LO0179-2-2',
    name: 'טבעת גאפ פליז',
    description: 'טבעת גאפ פליז, מק"ט LO0179-2-2',
    price: 189.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1693393238_5f060d6feecb30e653af43eda9e3d7b9-1-600x600.jpg',
    ],
    tags: ['טבעת', 'גאפ', 'פליז'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'ZSI2003-1',
    name: 'צמיד טניס משובץ כסף אמיתי',
    description: 'צמיד טניס משובץ כסף אמיתי, מק"ט ZSI2003-1',
    price: 619.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1713351933_721967841030-scaled-1-600x600.jpg',
    ],
    tags: ['צמיד', 'טניס', 'משובץ', 'כסף', 'אמיתי'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: '41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1',
    name: 'סט עגילים פליז משובץ',
    description:
      'סט עגילים פליז משובץ, מק"ט 41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/D7AAD79ED795D7A0D794-D7A9D79C-WhatsAppE2808F-2024-08-06-D791D7A9D7A2D794-10.37.52_789e882e-600x800.jpg',
    ],
    tags: ['עגילים', 'סט', 'פליז', 'משובץ'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: '41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2',
    name: 'סט פנינה כחול',
    description:
      'סט פנינה כחול, מק"ט 41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/08/SET-2-600x600.jpg',
    ],
    tags: ['סט', 'פנינה', 'כחול'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [], // No clear category from name alone
  },
  {
    sku: 'LSI8015-2',
    name: 'שרשרת לב גדול משובץ גוון רוז',
    description: 'שרשרת לב גדול משובץ גוון רוז, מק"ט LSI8015-2',
    price: 219.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725452774_PJ9B4488-scaled-1-600x600.jpg',
    ],
    tags: ['שרשרת', 'לב', 'משובץ', 'רוז'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: 'KSI4011-3',
    name: 'סט טבעות מור זהב',
    description: 'סט טבעות מור זהב, מק"ט KSI4011-3',
    price: 269.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725955892__DSC3252-scaled-1-600x400.jpg',
    ],
    tags: ['טבעות', 'סט', 'מור', 'זהב'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'CSI034-1',
    name: 'טבעת סילבר משובצת אבן מרובעת',
    description: 'טבעת סילבר משובצת אבן מרובעת, מק"ט CSI034-1',
    price: 219.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716801658_94d849b7246c37266aba0c0c3e0c0454-600x594.png',
    ],
    tags: ['טבעת', 'סילבר', 'משובצת', 'אבן', 'מרובעת'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'TSI5001-1',
    name: 'שרשרת אבן שחורה',
    description: 'שרשרת אבן שחורה, מק"ט TSI5001-1',
    price: 189.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/TSI5001-11238-600x600.jpg',
    ],
    tags: ['שרשרת', 'אבן', 'שחורה'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: '4-1592_F4541-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1',
    name: 'סט 4 עגילים נופלים',
    description:
      'סט 4 עגילים נופלים, מק"ט 4-1592_F4541-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/D7AAD79ED795D7A0D794-D7A9D79C-WhatsAppE2808F-2024-08-06-D791D7A9D7A2D794-10.37.48_03e2f278-600x800.jpg',
    ],
    tags: ['עגילים', 'סט', 'נופלים'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'ZSI725-1',
    name: 'טבעת לב טהור',
    description: 'טבעת לב טהור, מק"ט ZSI725-1',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1736244773_1735638638_PJ9B0698-600x600.jpg',
    ],
    tags: ['טבעת', 'לב', 'טהור'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'lo0110',
    name: 'עגילי יובל כסף',
    description: 'עגילי יובל כסף, מק"ט lo0110',
    price: 99.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1736248308_1689779788_PJ9B9323-scaled-1-600x600.jpg',
    ],
    tags: ['עגילים', 'יובל', 'כסף'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'CSI033-1',
    name: 'שרשרת סילבר משובצת אבן מרובעת',
    description: 'שרשרת סילבר משובצת אבן מרובעת, מק"ט CSI033-1',
    price: 219.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716801649_5d1aefbfd4eb40e9eb841bc335303604-600x600.jpg',
    ],
    tags: ['שרשרת', 'סילבר', 'משובצת', 'אבן', 'מרובעת'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: 'ZSI615-3',
    name: 'שרשר חרוזים זהב קלאסית',
    description: 'שרשר חרוזים זהב קלאסית, מק"ט ZSI615-3',
    price: 429.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1721719610_PJ9B7448-600x600.jpg',
    ],
    tags: ['שרשרת', 'חרוזים', 'זהב', 'קלאסית'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: 'KSI4013-3',
    name: 'סט טבעות שני זהב',
    description: 'סט טבעות שני זהב, מק"ט KSI4013-3',
    price: 269.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725955691__DSC3225-scaled-1-600x400.jpg',
    ],
    tags: ['טבעות', 'סט', 'שני', 'זהב'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'KSI3039-3.',
    name: 'טבעת טל משובצת ציפוי זהב',
    description: 'טבעת טל משובצת ציפוי זהב, מק"ט KSI3039-3.',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716404331_721967842945-600x600.jpg',
    ],
    tags: ['טבעת', 'טל', 'משובצת', 'ציפוי', 'זהב'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'KSI3039-2.',
    name: 'טבעת טל משובצת גוון רוז',
    description: 'טבעת טל משובצת גוון רוז, מק"ט KSI3039-2.',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716404331_721967842938-600x600.jpg',
    ],
    tags: ['טבעת', 'טל', 'משובצת', 'גוון', 'רוז'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'KSI3039-1.',
    name: 'טבעת יעל כסף אמיתי',
    description: 'טבעת יעל כסף אמיתי, מק"ט KSI3039-1.',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/08/1716404331_721967842921-2-600x600.jpg',
    ],
    tags: ['טבעת', 'יעל', 'כסף', 'אמיתי'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'KSI4013-1',
    name: 'סט טבעות שני כסף אמיתי',
    description: 'סט טבעות שני כסף אמיתי, מק"ט KSI4013-1',
    price: 269.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725955666__DSC3237-scaled-1-600x400.jpg',
    ],
    tags: ['טבעות', 'סט', 'שני', 'כסף', 'אמיתי'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'KSI4010-1',
    name: 'טבעת משובצת אבנים צבעוניות',
    description: 'טבעת משובצת אבנים צבעוניות, מק"ט KSI4010-1',
    price: 189.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725955108__DSC3163-scaled-1-600x400.jpg',
    ],
    tags: ['טבעת', 'משובצת', 'אבנים', 'צבעוניות'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'KSI3045-1.',
    name: 'טבעת ספיר כסף אמיתי',
    description: 'טבעת ספיר כסף אמיתי, מק"ט KSI3045-1.',
    price: 219.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716404335_721967843089-600x601.jpg',
    ],
    tags: ['טבעת', 'ספיר', 'כסף', 'אמיתי'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'KSI4012-1',
    name: 'סט טבעות דקלה כסף אמיתי',
    description: 'סט טבעות דקלה כסף אמיתי, מק"ט KSI4012-1',
    price: 269.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725955539__DSC3262-scaled-1-600x400.jpg',
    ],
    tags: ['טבעות', 'סט', 'דקלה', 'כסף', 'אמיתי'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'ZSI319-BLACK-2',
    name: 'טבעת סנדי משובצת אבנים שחורות ציפוי זהב',
    description: 'טבעת סנדי משובצת אבנים שחורות ציפוי זהב, מק"ט ZSI319-BLACK-2',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1684394430_PJ9B4224-600x600.jpg',
    ],
    tags: ['טבעת', 'סנדי', 'משובצת', 'אבנים', 'שחורות', 'ציפוי', 'זהב'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[0].id],
  },
  {
    sku: 'ESI207-3',
    name: 'צמיד חבל פנינים',
    description: 'צמיד חבל פנינים, מק"ט ESI207-3',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1720595660_3U2A9200-600x600.jpg',
    ],
    tags: ['צמיד', 'חבל', 'פנינים'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: 'ZSI080-2',
    name: 'צמיד טניס אבנים צבעוניות',
    description: 'צמיד טניס אבנים צבעוניות, מק"ט ZSI080-2',
    price: 219.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1736248253_1689507523_ZSI415-600x600.jpg',
    ],
    tags: ['צמיד', 'טניס', 'אבנים', 'צבעוניות'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: 'JSI143',
    name: 'צמיד אבנים משתלשלות כסף אמיתי',
    description: 'צמיד אבנים משתלשלות כסף אמיתי, מק"ט JSI143',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/C4641-600x600.jpg',
    ],
    tags: ['צמיד', 'אבנים', 'משתלשלות', 'כסף', 'אמיתי'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: 'ZSI078',
    name: 'צמיד כוכב כסף אמיתי',
    description: 'צמיד כוכב כסף אמיתי, מק"ט ZSI078',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1663620230_rcMeFv9-scaled-1-600x600.jpg',
    ],
    tags: ['צמיד', 'כוכב', 'כסף', 'אמיתי'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: 'KSI3020-2',
    name: 'צמיד אלינור רוז גולד',
    description: 'צמיד אלינור רוז גולד, מק"ט KSI3020-2',
    price: 669.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725794606_9_OP24_9301_S-R-600x600.jpg',
    ],
    tags: ['צמיד', 'אלינור', 'רוז', 'גולד'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: 'ESI203-3',
    name: 'צמיד חבל פנינים צבעוניות',
    description: 'צמיד חבל פנינים צבעוניות, מק"ט ESI203-3',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1720595166_3U2A9194-600x600.jpg',
    ],
    tags: ['צמיד', 'חבל', 'פנינים', 'צבעוניות'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: 'ESI201-3',
    name: 'צמיד חבל פנינים טורקיז',
    description: 'צמיד חבל פנינים טורקיז, מק"ט ESI201-3',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1720594628_3U2A94073-600x600.jpg',
    ],
    tags: ['צמיד', 'חבל', 'פנינים', 'טורקיז'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: 'zsi587-1',
    name: 'צמיד מלכות',
    description: 'צמיד מלכות, מק"ט zsi587-1',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1736248338_1688994124_4aa1bfab430b104c982d04106a07f61b-1-300x300-1.jpg',
    ],
    tags: ['צמיד', 'מלכות'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: 'ZSI474-1',
    name: 'צמיד  מגן דוד כסף',
    description: 'צמיד  מגן דוד כסף, מק"ט ZSI474-1',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/08/1702905958_PJ9B7872-1-600x600.jpg',
    ],
    tags: ['צמיד', 'מגן', 'דוד', 'כסף'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: 'ZSI057',
    name: 'צמיד טניס 2.5 מ"מ',
    description: 'צמיד טניס 2.5 מ"מ, מק"ט ZSI057',
    price: 539.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/08/1663526851_ZSI057201-scaled-3-600x600.jpg',
    ],
    tags: ['צמיד', 'טניס'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[2].id],
  },
  {
    sku: 'ZSI724-2',
    name: 'עגילי אביב',
    description: 'עגילי אביב, מק"ט ZSI724-2',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1736244793_1735638573_PJ9B0656-600x600.jpg',
    ],
    tags: ['עגילים', 'אביב'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'KSI3030-2',
    name: 'זוג עגילי עלים כסף אמיתי גוון רוז',
    description: 'זוג עגילי עלים כסף אמיתי גוון רוז, מק"ט KSI3030-2',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716289608_721967842662-300x300-1.jpg',
    ],
    tags: ['עגילים', 'זוג', 'עלים', 'כסף', 'אמיתי', 'גוון', 'רוז'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'TSI5068-3',
    name: 'עגילי אריאה',
    description: 'עגילי אריאה, מק"ט TSI5068-3',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725952659__DSC6342-600x600.jpg',
    ],
    tags: ['עגילים', 'אריאה'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'ZSI648-1',
    name: 'עגילים מרובע',
    description: 'עגילים מרובע, מק"ט ZSI648-1',
    price: 189.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/08/1721653411_PJ9B4441-1-600x600.jpg',
    ],
    tags: ['עגילים', 'מרובע'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'ZSI649-1',
    name: 'עגילים נופלים נרקיס כסף',
    description: 'עגילים נופלים נרקיס כסף, מק"ט ZSI649-1',
    price: 399.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/08/1721653687_PJ9B5336-1-1-600x600.jpg',
    ],
    tags: ['עגילים', 'נופלים', 'נרקיס', 'כסף'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'zsi594-1',
    name: 'עגיל טיפה כסף',
    description: 'עגיל טיפה כסף, מק"ט zsi594-1',
    price: 189.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1736248440_1714031687_9K3A9635-scaled-1-600x600.jpg',
    ],
    tags: ['עגילים', 'טיפה', 'כסף'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'ZSI597-3',
    name: 'עגילי פרפר מצופה זהב',
    description: 'עגילי פרפר מצופה זהב, מק"ט ZSI597-3',
    price: 219.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1718006990_PJ9B4598-600x600.jpg',
    ],
    tags: ['עגילים', 'פרפר', 'מצופה', 'זהב'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'ESI010-1',
    name: 'שרשרת פנינים תום',
    description: 'שרשרת פנינים תום, מק"ט ESI010-1',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1720515617_3U2A9761-600x600.jpg',
    ],
    tags: ['שרשרת', 'פנינים', 'תום'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: 'ZSI184-2',
    name: 'שרשרת סמיילי MOM רוז גולד',
    description: 'שרשרת סמיילי MOM רוז גולד, מק"ט ZSI184-2',
    price: 129.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/632698bbade70_D7A9D7A8D7A9D7A8D7AA20ZSI076-scaled-1-600x600.jpeg',
    ],
    tags: ['שרשרת', 'סמיילי', 'MOM', 'רוז', 'גולד'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: 'LSI8002-2',
    name: 'שרשרת טיפה אבן שקופה גוון רוז',
    description: 'שרשרת טיפה אבן שקופה גוון רוז, מק"ט LSI8002-2',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725453116_PJ9B4491-scaled-1-600x600.jpg',
    ],
    tags: ['שרשרת', 'טיפה', 'אבן', 'שקופה', 'גוון', 'רוז'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: 'LOZ2301-1',
    name: 'שרשרת מאיה כסף',
    description: 'שרשרת מאיה כסף, מק"ט LOZ2301-1',
    price: 279.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1736247510_1701606312_ZSI185-scaled-1-600x600.jpg',
    ],
    tags: ['שרשרת', 'מאיה', 'כסף'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: 'ZSI615-1',
    name: 'שרשרת חרוזי כסף',
    description: 'שרשרת חרוזי כסף, מק"ט ZSI615-1',
    price: 749.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1716116185_PJ9B2929-600x600.jpg',
    ],
    tags: ['שרשרת', 'חרוזי', 'כסף'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: 'ZSI638-1',
    name: 'MOM שרשרת פנינים גוון כסף',
    description: 'MOM שרשרת פנינים גוון כסף, מק"ט ZSI638-1',
    price: 379.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716119921_PJ9B2958-600x600.jpg',
    ],
    tags: ['שרשרת', 'MOM', 'פנינים', 'גוון', 'כסף'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: '41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1',
    name: 'סט נוגה שרשרת ו2 טבעות',
    description:
      'סט נוגה שרשרת ו2 טבעות, מק"ט 41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/D7AAD79ED795D7A0D794-D7A9D79C-WhatsAppE2808F-2024-04-03-D791D7A9D7A2D794-10.24.25_a0cf1080-600x800.jpg',
    ],
    tags: ['שרשרות', 'טבעות', 'סט', 'נוגה'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [
      greenJewelryCategoryData[3].id,
      greenJewelryCategoryData[0].id,
    ],
  },
  {
    sku: 'LSI8001-2',
    name: 'שרשרת דואל אבן שקופה רוז גולד',
    description: 'שרשרת דואל אבן שקופה רוז גולד, מק"ט LSI8001-2',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725452974_PJ9B4491-scaled-1-600x600.jpg',
    ],
    tags: ['שרשרת', 'דואל', 'אבן', 'שקופה', 'רוז', 'גולד'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: '1-ZSI535',
    name: 'שרשרת אמרלד כסף',
    description: 'שרשרת אמרלד כסף, מק"ט 1-ZSI535',
    price: 219.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/1736248375_1687358558_6f20d17f5af18750efb65a4bbd39d770-600x600.jpg',
    ],
    tags: ['שרשרת', 'אמרלד', 'כסף'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: '41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2-1-1-1',
    name: 'סט כסף מרובע',
    description:
      'סט כסף מרובע, מק"ט 41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2-1-1-1',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/08/SET-4-600x600.jpg',
    ],
    tags: ['סט', 'כסף', 'מרובע'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [
      greenJewelryCategoryData[1].id,
      greenJewelryCategoryData[2].id,
      greenJewelryCategoryData[3].id,
    ],
  },
  {
    sku: 'KSI3025-2',
    name: 'זוג עגילי חמסה צמודים כסף אמיתי גוון רוז',
    description: 'זוג עגילי חמסה צמודים כסף אמיתי גוון רוז, מק"ט KSI3025-2',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716289605_721967842518-300x300-1.jpg',
    ],
    tags: ['עגילים', 'חמסה', 'צמודים', 'כסף', 'אמיתי', 'רוז'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'Lsi8007-2',
    name: 'זוג עגילי טיפה נופלים בשילוב אבנים טורקיז',
    description: 'זוג עגילי טיפה נופלים בשילוב אבנים טורקיז, מק"ט Lsi8007-2',
    price: 189.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725796695_LSI8007-2-scaled-1-600x600.jpg',
    ],
    tags: ['עגילים', 'טיפה', 'נופלים', 'טורקיז'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'KSI3030-1',
    name: 'זוג עגילי עלים כסף אמיתי',
    description: 'זוג עגילי עלים כסף אמיתי, מק"ט KSI3030-1',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716289608_721967842655-300x300-1.jpg',
    ],
    tags: ['עגילים', 'עלים', 'כסף', 'אמיתי'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'KSI3030-3',
    name: 'זוג עגילי עלים כסף אמיתי מצופה זהב',
    description: 'זוג עגילי עלים כסף אמיתי מצופה זהב, מק"ט KSI3030-3',
    price: 159.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1716289608_721967842679-300x300-1.jpg',
    ],
    tags: ['עגילים', 'עלים', 'כסף', 'אמיתי', 'מצופה', 'זהב'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'TSI5070-2',
    name: 'זוג עגילים כסף אמיתי גוון רוז גולד משובץ 3 אבנים',
    description:
      'זוג עגילים כסף אמיתי גוון רוז גולד משובץ 3 אבנים, מק"ט TSI5070-2',
    price: 239.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725889544__DSC6452-600x600.jpg',
    ],
    tags: ['עגילים', 'כסף', 'אמיתי', 'רוז', 'גולד', 'משובץ'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: 'Lsi8007-1',
    name: 'זוג עגילים נופלים בשילוב אבנים טורקיז',
    description: 'זוג עגילים נופלים בשילוב אבנים טורקיז, מק"ט Lsi8007-1',
    price: 189.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/1725796712_LSI8007-1-scaled-1-600x600.jpg',
    ],
    tags: ['עגילים', 'נופלים', 'טורקיז'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
  {
    sku: '41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2-1-1-1-1-1',
    name: 'סט זהב פרפר',
    description:
      'סט זהב פרפר, מק"ט 41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2-1-1-1-1-1',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/08/SET-9-600x600.jpg',
    ],
    tags: ['סט', 'זהב', 'פרפר'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [
      greenJewelryCategoryData[0].id,
      greenJewelryCategoryData[1].id,
    ],
  },
  {
    sku: '41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2-1-1-1-1-V2',
    name: 'סט כסף פרפר',
    description:
      'סט כסף פרפר, מק"ט 41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2-1-1-1-1',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/08/SET-8-600x600.jpg',
    ],
    tags: ['סט', 'כסף', 'פרפר'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [
      greenJewelryCategoryData[1].id,
      greenJewelryCategoryData[2].id,
      greenJewelryCategoryData[3].id,
    ],
  },
  {
    sku: 'ZSI638-2',
    name: 'MOM שרשרת פנינים',
    description: 'MOM שרשרת פנינים, מק"ט ZSI638-2',
    price: 379.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/08/1716119927_PJ9B2956-2-600x600.jpg',
    ],
    tags: ['שרשרת', 'MOM', 'פנינים'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: '41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1',
    name: 'סט עדן אבנים תליון ארוך',
    description:
      'סט עדן אבנים תליון ארוך, מק"ט 41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/D7AAD79ED795D7A0D794-D7A9D79C-WhatsAppE2808F-2024-04-03-D791D7A9D7A2D794-10.24.25_642ebfa5-600x800.jpg',
    ],
    tags: ['סט', 'עדן', 'אבנים', 'תליון', 'ארוך'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: '41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2-1-1-1-1',
    name: 'סט פנינים צמיד ושרשרת משולב',
    description:
      'סט פנינים צמיד ושרשרת משולב, מק"ט 41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-2-1-1-1-1',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/D7AAD79ED795D7A0D794-D7A9D79C-WhatsAppE2808F-2024-06-30-D791D7A9D7A2D794-15.00.31_94b39971-600x800.jpg',
    ],
    tags: ['סט', 'פנינים', 'צמיד', 'שרשרת'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [
      greenJewelryCategoryData[2].id,
      greenJewelryCategoryData[3].id,
    ],
  },
  {
    sku: '41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1',
    name: 'סט קארין תליון ארוך',
    description:
      'סט קארין תליון ארוך, מק"ט 41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/D7AAD79ED795D7A0D794-D7A9D79C-WhatsAppE2808F-2024-04-03-D791D7A9D7A2D794-10.24.25_41d3b2b4-600x690.jpg',
    ],
    tags: ['סט', 'קארין', 'תליון', 'ארוך'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[3].id],
  },
  {
    sku: '41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2-1',
    name: 'סט שלושה חלקים משובץ כסף אמיתי',
    description:
      'סט שלושה חלקים משובץ כסף אמיתי, מק"ט 41592_F454-1-1-1-1-2-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-2-1',
    price: 479.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/SET-1-600x600.jpg',
    ],
    tags: ['סט', 'משובץ', 'כסף', 'אמיתי'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [
      greenJewelryCategoryData[1].id,
      greenJewelryCategoryData[2].id,
      greenJewelryCategoryData[3].id,
    ],
  },
  {
    sku: 'ZSI038',
    name: 'עגיל כוכב נופל כסף',
    description: 'עגיל כוכב נופל כסף, מק"ט ZSI038',
    price: 79.0,
    imageUrls: [
      'https://greenjewelry.co.il/wp-content/uploads/2025/02/631e1a8020974_D79CD791D79F-1-scaled-1-600x600.jpeg',
    ],
    tags: ['עגילים', 'כוכב', 'נופל', 'כסף'],
    stockLevel: 10,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    categoryIds: [greenJewelryCategoryData[1].id],
  },
];

export const greenJewelryAboutContentData: RawAboutContentData = {
  storeId: GREEN_JEWELRY_STORE_ID,
  title: 'אודות תכשיטי גרין',
  content:
    greenJewelryStoreData.description ||
    'תכשיטי גרין - להתרגש כול יום מחדש. אנו מציעים קולקציה רחבה של תכשיטים איכותיים בעיצובים מרהיבים. כל תכשיט נבחר בקפידה כדי להבטיח שתקבלו את הטוב ביותר.',
  imageUrl:
    'https://greenjewelry.co.il/wp-content/uploads/2024/09/cropped-green-logo.png',
};

export const greenJewelryTestimonialData: RawTestimonialData[] = [
  {
    storeId: GREEN_JEWELRY_STORE_ID,
    author: 'מאיה כהן',
    quote: 'שירות מעולה ותכשיטים מהממים! ממליצה בחום.',
    date: new Date('2025-04-20'),
    rating: 5,
  },
  {
    storeId: GREEN_JEWELRY_STORE_ID,
    author: 'דוד לוי',
    quote: 'הזמנתי מתנה לאשתי והיא הייתה מאושרת. תודה רבה!',
    date: new Date('2025-03-15'),
    rating: 5,
  },
];

export const greenJewelryFaqData: RawFaqData[] = [
  {
    storeId: GREEN_JEWELRY_STORE_ID,
    question: 'מהי מדיניות המשלוחים שלכם?',
    answer:
      'משלוח מהיר לכל חלקי הארץ. לפרטים נוספים, עיינו בעמוד מדיניות המשלוחים.',
  },
  {
    storeId: GREEN_JEWELRY_STORE_ID,
    question: 'האם ניתן להחליף פריט?',
    answer: 'כן, ניתן להחליף פריט עד 14 יום מקבלתו, בהתאם לתקנון ההחלפות.',
  },
];

export const greenJewelryCarouselItemData: RawCarouselItemData[] = [
  {
    imageUrl:
      'https://greenjewelry.co.il/wp-content/uploads/2024/10/ללא-שם-800-x-1400-פיקסל-585x1024.png',
    altText: 'מבצע טבעות',
    linkUrl: `product_sku:${greenJewelryProductData[0].sku}`,
    storeId: GREEN_JEWELRY_STORE_ID,
  },
  {
    imageUrl:
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/D7AAD79ED795D7A0D794-D7A9D79C-WhatsApp_-2024-08-06-D791D7A9D7A2D794-10.37.47_f965afec-768x1024.jpg',
    altText: 'קולקציית עגילים חדשה',
    linkUrl: `product_sku:${greenJewelryProductData[2].sku}`,
    storeId: GREEN_JEWELRY_STORE_ID,
  },
  {
    imageUrl:
      'https://greenjewelry.co.il/wp-content/uploads/2024/09/woman-wearing-diamond-necklace-ring-1024x683.jpg',
    altText: 'שרשראות מיוחדות',
    linkUrl: `product_sku:${greenJewelryProductData[4].sku}`,
    storeId: GREEN_JEWELRY_STORE_ID,
  },
];

const GJ_USER_ID_1 = 'f1010000-aaaa-1111-1111-000000000001'; // Was g000user-
const GJ_USER_ID_2 = 'f1010000-bbbb-1111-1111-000000000002'; // Was g000user-
const GJ_MANAGER_USER_ID = 'f1010000-cccc-1111-1111-000000000003'; // Was g000user-
const GJ_ADDRESS_ID_1 = 'f1020000-aaaa-1111-1111-000000000001'; // Was g000addr-
const GJ_ADDRESS_ID_2 = 'f1020000-bbbb-1111-1111-000000000002'; // Was g000addr-

export const greenJewelryUserData: RawUserData[] = [
  {
    id: GJ_USER_ID_1,
    email: 'yael.cohen@example.co.il',
    firstName: 'יעל',
    lastName: 'כהן',
    roles: ['customer'],
    passwordHash: 'bcrypt_hashed_password_placeholder_for_green_jewelry',
    profilePictureUrl: 'https://picsum.photos/seed/yael.cohen/200/200',
  },
  {
    id: GJ_USER_ID_2,
    email: 'moshe.levi@example.co.il',
    firstName: 'משה',
    lastName: 'לוי',
    roles: ['customer'],
    passwordHash: 'bcrypt_hashed_password_placeholder_for_green_jewelry',
    profilePictureUrl: 'https://picsum.photos/seed/moshe.levi/200/200',
  },
  {
    id: GJ_MANAGER_USER_ID,
    email: 'manager.gj@example.co.il',
    firstName: 'מנהל',
    lastName: 'גרין',
    roles: ['manager', 'customer'],
    passwordHash: 'bcrypt_hashed_password_placeholder_for_green_jewelry',
    profilePictureUrl: 'https://picsum.photos/seed/manager.gj/200/200',
  },
  {
    id: 'f1010000-dddd-1111-1111-000000000004',
    email: 'test.user@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['customer'],
    passwordHash: 'bcrypt_hashed_password_placeholder_for_green_jewelry',
    phone: '+972583215251',
  },
  {
    id: 'f1010000-dddd-1111-1111-000000000005',
    email: 'test.user2@example.com',
    firstName: 'Test',
    lastName: 'User2',
    roles: ['customer'],
    passwordHash: 'bcrypt_hashed_password_placeholder_for_green_jewelry',
    phone: '+972534758922',
  },
  {
    id: 'f1010000-dddd-1111-1111-000000000006',
    email: 'test.user3@example.com',
    firstName: 'Test',
    lastName: 'User3',
    roles: ['customer'],
    passwordHash: 'bcrypt_hashed_password_placeholder_for_green_jewelry',
    phone: '+972506105590',
  },
];

export const greenJewelryAddressData: RawAddressData[] = [
  {
    id: GJ_ADDRESS_ID_1,
    userId: GJ_USER_ID_1,
    fullName: 'יעל כהן',
    street1: 'רחוב הרצל 10',
    city: 'תל אביב',
    postalCode: '6608303',
    country: 'IL',
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
  {
    id: GJ_ADDRESS_ID_2,
    userId: GJ_USER_ID_2,
    fullName: 'משה לוי',
    street1: 'שדרות רוטשילד 25',
    city: 'תל אביב',
    postalCode: '6 Rothschild Blvd',
    country: 'IL',
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
  {
    id: 'f1020000-cccc-1111-1111-000000000003', // New address for A@A.com
    userId: 'c1d2e3f4-a5b6-9999-aaaa-bbbbccccdddd',
    fullName: 'Admin User',
    street1: '1 Admin Way',
    city: 'Tech City',
    postalCode: '90210',
    country: 'USA',
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
];

const gjProductForOrder1 = greenJewelryProductData.find(
  (p) => p.sku === 'GJ-RNG-001',
);
const gjProductForOrder2 = greenJewelryProductData.find(
  (p) => p.sku === 'GJ-EAR-001',
);

const orderItems1: RawOrderItemData[] = [];
if (gjProductForOrder1) {
  orderItems1.push({
    productId: gjProductForOrder1.sku, // Using SKU as productID for raw data
    quantity: 1,
    pricePerUnit: gjProductForOrder1.price,
    productName: gjProductForOrder1.name,
  });
}
if (gjProductForOrder2) {
  orderItems1.push({
    productId: gjProductForOrder2.sku, // Using SKU as productID for raw data
    quantity: 1,
    pricePerUnit: gjProductForOrder2.price,
    productName: gjProductForOrder2.name,
  });
}

export const greenJewelryOrderData: RawOrderData[] = [];
if (gjProductForOrder1 && gjProductForOrder2 && orderItems1.length === 2) {
  const subtotal = orderItems1.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0,
  );
  const shippingCost = 25.0;
  const taxRate = 0.17;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + shippingCost + taxAmount;

  greenJewelryOrderData.push({
    id: 'f1030000-aaaa-1111-1111-000000000001', // Was g000ordr-
    orderReference: `GJ-ORD-${Date.now()}-001`,
    userId: GJ_USER_ID_1,
    storeId: GREEN_JEWELRY_STORE_ID,
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
    shippingAddressId: GJ_ADDRESS_ID_1,
    shippingMethod: 'משלוח רגיל',
    trackingNumber: 'GJTRK123456789',
    items: orderItems1,
  });
}

const gjProductForWishlist = greenJewelryProductData.find(
  (p) => p.sku === 'GJ-NCK-001',
);
export const greenJewelryWishlistData: RawWishlistData[] = [];
if (gjProductForWishlist) {
  greenJewelryWishlistData.push({
    id: 'f1040000-aaaa-1111-1111-000000000001', // Was g000wish-
    userId: GJ_USER_ID_2,
    storeId: GREEN_JEWELRY_STORE_ID,
    items: [{ productId: gjProductForWishlist.sku }], // Using SKU as productID
  });
}

const gjProductForReview = greenJewelryProductData.find(
  (p) => p.sku === 'GJ-RNG-002',
);
export const greenJewelryReviewData: RawReviewData[] = [];
if (gjProductForReview) {
  greenJewelryReviewData.push(
    {
      id: 'f1050000-aaaa-1111-1111-000000000001', // Was g000revw-
      productId: gjProductForReview.sku, // Using SKU as productID
      userId: GJ_USER_ID_1,
      storeId: GREEN_JEWELRY_STORE_ID,
      rating: 5,
      comment: 'טבעת מהממת! בדיוק כמו בתמונה, הגיעה מהר.',
    },
    {
      id: 'f1050000-bbbb-1111-1111-000000000002', // Was g000revw-
      productId: gjProductForReview.sku, // Using SKU as productID
      userId: GJ_USER_ID_2,
      storeId: GREEN_JEWELRY_STORE_ID,
      rating: 4,
      comment: 'איכות טובה, קצת יקר לטעמי אבל יפה.',
    },
  );
}

export const greenJewelryPromoCodeData: RawPromoCodeData[] = [
  {
    id: 'f1060000-aaaa-1111-1111-000000000001', // Was g000prom-
    code: 'GREEN15',
    discountType: 'percentage',
    discountValue: 15,
    isActive: true,
    storeId: GREEN_JEWELRY_STORE_ID,
    validTo: new Date('2025-12-31'),
  },
  {
    id: 'f1060000-bbbb-1111-1111-000000000002', // Was g000prom-
    code: 'SAVE50GJ',
    discountType: 'fixed',
    discountValue: 50,
    isActive: true,
    minCartValue: 300,
    storeId: GREEN_JEWELRY_STORE_ID,
  },
];

// --- Orders for A@A.com user ---
const AA_USER_ID = 'c1d2e3f4-a5b6-9999-aaaa-bbbbccccdddd';
const AA_USER_ADDRESS_ID = 'f1020000-cccc-1111-1111-000000000003';

const aaUserProduct1 = greenJewelryProductData.find(
  (p) => p.sku === 'GJ-RNG-001',
); // טבעת גבע כסף
const aaUserProduct2 = greenJewelryProductData.find(
  (p) => p.sku === 'GJ-EAR-001',
); // זוג עגילי חמסה צמודים כסף אמיתי
const aaUserProduct3 = greenJewelryProductData.find(
  (p) => p.sku === 'GJ-BRC-001',
); // צמיד טניס משובץ כסף אמיתי
const aaUserProduct4 = greenJewelryProductData.find(
  (p) => p.sku === 'GJ-NCK-001',
); // שרשרת טיפה אבן טורקיז
const aaUserProduct5 = greenJewelryProductData.find((p) => p.sku === 'JSI082'); // טבעת גבע כסף (another one)
const aaUserProduct6 = greenJewelryProductData.find(
  (p) => p.sku === 'LO0179-2-2',
); // טבעת גאפ פליז

export const aaUserGreenJewelryOrdersData: RawOrderData[] = [];

if (
  aaUserProduct1 &&
  aaUserProduct2 &&
  aaUserProduct3 &&
  aaUserProduct4 &&
  aaUserProduct5 &&
  aaUserProduct6
) {
  const order1Items: RawOrderItemData[] = [
    {
      productId: aaUserProduct1.sku,
      quantity: 1,
      pricePerUnit: aaUserProduct1.price,
      productName: aaUserProduct1.name,
    },
    {
      productId: aaUserProduct2.sku,
      quantity: 2,
      pricePerUnit: aaUserProduct2.price,
      productName: aaUserProduct2.name,
    },
  ];
  const order1Subtotal = order1Items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0,
  );
  const order1ShippingCost = 10.0;
  const order1TaxAmount = order1Subtotal * 0.1;
  const order1TotalAmount =
    order1Subtotal + order1ShippingCost + order1TaxAmount;

  aaUserGreenJewelryOrdersData.push({
    id: 'f1030000-bbbb-1111-1111-000000000002',
    orderReference: `AA-ORD-${Date.now()}-001`,
    userId: AA_USER_ID,
    storeId: GREEN_JEWELRY_STORE_ID,
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    subtotal: order1Subtotal,
    shippingCost: order1ShippingCost,
    taxAmount: order1TaxAmount,
    totalAmount: order1TotalAmount,
    shippingAddressId: AA_USER_ADDRESS_ID,
    shippingMethod: 'Standard Shipping',
    items: order1Items,
    orderDate: new Date('2025-05-20T10:00:00Z'),
  });

  const order2Items: RawOrderItemData[] = [
    {
      productId: aaUserProduct3.sku,
      quantity: 1,
      pricePerUnit: aaUserProduct3.price,
      productName: aaUserProduct3.name,
    },
  ];
  const order2Subtotal = order2Items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0,
  );
  const order2ShippingCost = 10.0;
  const order2TaxAmount = order2Subtotal * 0.1;
  const order2TotalAmount =
    order2Subtotal + order2ShippingCost + order2TaxAmount;

  aaUserGreenJewelryOrdersData.push({
    id: 'f1030000-cccc-1111-1111-000000000003',
    orderReference: `AA-ORD-${Date.now()}-002`,
    userId: AA_USER_ID,
    storeId: GREEN_JEWELRY_STORE_ID,
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PAID,
    subtotal: order2Subtotal,
    shippingCost: order2ShippingCost,
    taxAmount: order2TaxAmount,
    totalAmount: order2TotalAmount,
    shippingAddressId: AA_USER_ADDRESS_ID,
    shippingMethod: 'Express Shipping',
    items: order2Items,
    orderDate: new Date('2025-06-01T14:30:00Z'),
  });

  // Order 3: 3 items
  const order3Items: RawOrderItemData[] = [
    {
      productId: aaUserProduct1.sku,
      quantity: 1,
      pricePerUnit: aaUserProduct1.price,
      productName: aaUserProduct1.name,
    },
    {
      productId: aaUserProduct4.sku,
      quantity: 1,
      pricePerUnit: aaUserProduct4.price,
      productName: aaUserProduct4.name,
    },
    {
      productId: aaUserProduct5.sku,
      quantity: 1,
      pricePerUnit: aaUserProduct5.price,
      productName: aaUserProduct5.name,
    },
  ];
  const order3Subtotal = order3Items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0,
  );
  const order3ShippingCost = 15.0;
  const order3TaxAmount = order3Subtotal * 0.1;
  const order3TotalAmount =
    order3Subtotal + order3ShippingCost + order3TaxAmount;

  aaUserGreenJewelryOrdersData.push({
    id: 'f1030000-dddd-1111-1111-000000000004',
    orderReference: `AA-ORD-${Date.now()}-003`,
    userId: AA_USER_ID,
    storeId: GREEN_JEWELRY_STORE_ID,
    status: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    subtotal: order3Subtotal,
    shippingCost: order3ShippingCost,
    taxAmount: order3TaxAmount,
    totalAmount: order3TotalAmount,
    shippingAddressId: AA_USER_ADDRESS_ID,
    shippingMethod: 'Standard Shipping',
    trackingNumber: 'AA-TRK-003',
    items: order3Items,
    orderDate: new Date('2025-06-02T11:00:00Z'),
  });

  // Order 4: 1 item
  const order4Items: RawOrderItemData[] = [
    {
      productId: aaUserProduct6.sku,
      quantity: 1,
      pricePerUnit: aaUserProduct6.price,
      productName: aaUserProduct6.name,
    },
  ];
  const order4Subtotal = order4Items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0,
  );
  const order4ShippingCost = 5.0;
  const order4TaxAmount = order4Subtotal * 0.1;
  const order4TotalAmount =
    order4Subtotal + order4ShippingCost + order4TaxAmount;

  aaUserGreenJewelryOrdersData.push({
    id: 'f1030000-eeee-1111-1111-000000000005',
    orderReference: `AA-ORD-${Date.now()}-004`,
    userId: AA_USER_ID,
    storeId: GREEN_JEWELRY_STORE_ID,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    subtotal: order4Subtotal,
    shippingCost: order4ShippingCost,
    taxAmount: order4TaxAmount,
    totalAmount: order4TotalAmount,
    shippingAddressId: AA_USER_ADDRESS_ID,
    shippingMethod: 'Economy Shipping',
    items: order4Items,
    orderDate: new Date('2025-06-03T09:15:00Z'),
  });

  // Order 5: 2 items (different from order 1)
  const order5Items: RawOrderItemData[] = [
    {
      productId: aaUserProduct4.sku,
      quantity: 2,
      pricePerUnit: aaUserProduct4.price,
      productName: aaUserProduct4.name,
    },
    {
      productId: aaUserProduct3.sku,
      quantity: 1,
      pricePerUnit: aaUserProduct3.price,
      productName: aaUserProduct3.name,
    },
  ];
  const order5Subtotal = order5Items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0,
  );
  const order5ShippingCost = 12.5;
  const order5TaxAmount = order5Subtotal * 0.1;
  const order5TotalAmount =
    order5Subtotal + order5ShippingCost + order5TaxAmount;

  aaUserGreenJewelryOrdersData.push({
    id: 'f1030000-ffff-1111-1111-000000000006',
    orderReference: `AA-ORD-${Date.now()}-005`,
    userId: AA_USER_ID,
    storeId: GREEN_JEWELRY_STORE_ID,
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    subtotal: order5Subtotal,
    shippingCost: order5ShippingCost,
    taxAmount: order5TaxAmount,
    totalAmount: order5TotalAmount,
    shippingAddressId: AA_USER_ADDRESS_ID,
    shippingMethod: 'Express Shipping',
    items: order5Items,
    orderDate: new Date('2025-06-04T16:45:00Z'),
  });
}
