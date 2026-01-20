import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoryEntity } from './categories/entities/category.entity';
import { ProductEntity } from './products/entities/product.entity';
import { StoreEntity } from './stores/entities/store.entity';
import { CarouselItem } from './carousel/entities/carousel.entity';
import { UserEntity } from './users/entities/user.entity';
import { AddressEntity } from './addresses/entities/address.entity';
import {
  OrderEntity,
  OrderStatus,
  PaymentStatus,
} from './orders/entities/order.entity';
import { OrderItemEntity } from './orders/entities/order-item.entity';
import { WishlistEntity } from './wishlist/entities/wishlist.entity';
import { WishlistItemEntity } from './wishlist/entities/wishlist-item.entity';
import { ProductVariantEntity } from './products/entities/product-variant.entity';
import { ReviewEntity } from './reviews/entities/review.entity';
import { FaqEntity } from './contact/entities/faq.entity';
import { AboutContentEntity } from './stores/entities/about-content.entity';
import { TestimonialEntity } from './stores/entities/testimonial.entity';
import { PromoCodeEntity } from './promo-codes/entities/promo-code.entity';
import { ShippingMethodEntity } from './shipping/entities/shipping-method.entity';
import { In, DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  GREEN_JEWELRY_STORE_ID,
  greenJewelryStoreData as gjStoreData,
  greenJewelryCategoryData as gjCategoryData,
  greenJewelryProductData as gjProductData,
  greenJewelryAboutContentData as gjAboutContentData,
  greenJewelryTestimonialData as gjTestimonialData,
  greenJewelryFaqData as gjFaqData,
  greenJewelryCarouselItemData as gjCarouselItemData,
  greenJewelryUserData as gjUserData,
  greenJewelryAddressData as gjAddressData,
  greenJewelryPromoCodeData as gjPromoCodeData,
  aaUserGreenJewelryOrdersData, // Added for A@A.com user's orders
  // Note: Order, Wishlist, and Review data from green-jewelry.data.ts
  // will be reconstructed within the bootstrap function using their respective logic,
  // after dependent entities (products, users, addresses) are created.
} from './seeds/green-jewelry.data';
import {
  LUXURY_JEWELRY_STORE_ID,
  luxuryJewelryStoreData as ljStoreData,
  luxuryJewelryCategoryData as ljCategoryData,
  luxuryJewelryProductData as ljProductData,
  luxuryJewelryAboutContentData as ljAboutContentData,
  luxuryJewelryTestimonialData as ljTestimonialData,
  luxuryJewelryFaqData as ljFaqData,
  luxuryJewelryCarouselItemData as ljCarouselItemData,
  luxuryJewelryUserData as ljUserData,
  luxuryJewelryAddressData as ljAddressData,
  luxuryJewelryPromoCodeData as ljPromoCodeData,
  luxuryJewelryOrderData as ljOrderData,
  luxuryJewelryWishlistData as ljWishlistData,
  luxuryJewelryReviewData as ljReviewData,
} from './seeds/luxury-jewelry.data';
import { shippingMethodData } from './seeds/shipping-method.data'; // Import shipping method seed data
import { CreditCardEntity } from './tranzila/entities/credit-card.entity';

// --- Define Seed Data ---

const storeData = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'גאדג\'טים ומוצרים מעולים',
    slug: 'awesome-gadgets',
    logoUrl: 'https://plus.unsplash.com/premium_photo-1750895096919-1a7f59cbdda4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QXdlc29tZSUyMEdhZGdldHMlMjAlMjYlMjBHb29kc3xlbnwwfHwwfHx8MA%3D%3D',
    isFeaturedInMarketplace: true,
    authorizedPhoneNumbers: ['+972583215251', '+972534758922', '+972506105590'],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'אופנה וכיף',
    slug: 'fashion-fun',
    logoUrl: 'https://images.unsplash.com/photo-1617348493867-55244641c60f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RmFzaGlvbiUyMCUyNiUyMEZ1biUyMFpvbmV8ZW58MHx8MHx8fDA%3D',
    isFeaturedInMarketplace: true,
    authorizedPhoneNumbers: ['+972583215251', '+972534758922', '+972506105590'],
  },
  {
    ...gjStoreData,
    authorizedPhoneNumbers: ['+972583215251', '+972534758922', '+972506105590'],
  }, // This will be updated in its own file
  {
    ...ljStoreData,
    authorizedPhoneNumbers: ['+972583215251', '+972534758922', '+972506105590'],
  }, // Luxury Jewelry store
];

// Assign categories to stores
const categoryData = [
  // Store 1: גאדג'טים ומוצרים מעולים
  {
    id: 'aaa00001-c246-4913-9166-f75a99ee0c21',
    name: 'אלקטרוניקה',
    description: 'גאדג\'טים ומכשירים',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1679079456083-9f288e224e96?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RWxlY3Ryb25pY3N8ZW58MHx8MHx8fDA%3D',
    storeId: storeData[0].id,
    isFeaturedInMarketplace: true,
  },
  {
    id: 'aaa00003-c246-4913-9166-f75a99ee0c21',
    name: 'מוצרי בית',
    description: 'פריטים לבית שלך',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1715071976149-6f26134fc7f0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8SG9tZSUyMEdvb2RzfGVufDB8fDB8fHww',
    storeId: storeData[0].id,
    isFeaturedInMarketplace: true,
  },
  {
    id: 'aaa00004-c246-4913-9166-f75a99ee0c21',
    name: 'ספרים',
    description: 'ספרות וחומרי קריאה',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1669652639337-c513cc42ead6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Qm9va3N8ZW58MHx8MHx8fDA%3D',
    storeId: storeData[0].id,
    isFeaturedInMarketplace: true,
  },
  {
    id: 'aaa00007-c246-4913-9166-f75a99ee0c21',
    name: 'מוצרי מטבח',
    description: 'קטגוריה חדשה',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1714702844124-be1377d19666?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8S2l0Y2hlbiUyMHByb2R1Y3RzfGVufDB8fDB8fHww',
    storeId: storeData[0].id,
  },
  // Store 2: אופנה וכיף
  {
    id: 'aaa00002-c246-4913-9166-f75a99ee0c21',
    name: 'הלבשה',
    description: 'בגדים ואופנה',
    imageUrl: 'https://images.unsplash.com/photo-1732257119998-b66cda63dcfc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Q2xvdGhpbmclMjBhbmQlMjBmYXNoaW9ufGVufDB8fDB8fHww',
    storeId: storeData[1].id,
    isFeaturedInMarketplace: true,
  },
  {
    id: 'aaa00005-c246-4913-9166-f75a99ee0c21',
    name: 'ספורט וחוץ',
    description: 'ציוד לספורט ופעילויות חוץ.',
    imageUrl: 'https://images.unsplash.com/photo-1598046655252-f0f143557dcb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fFNwb3J0cyUyMCUyNiUyME91dGRvb3JzfGVufDB8fDB8fHww',
    storeId: storeData[1].id,
    isFeaturedInMarketplace: true,
  },
  {
    id: 'aaa00006-c246-4913-9166-f75a99ee0c21',
    name: 'צעצועים ומשחקים',
    description: 'כיף לכל הגילאים.',
    imageUrl: 'https://images.unsplash.com/photo-1708032563896-06d7a8aef4e5?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q2hpbGRyZW4ncyUyMFBpY3R1cmUlMjBCb29rfGVufDB8fDB8fHww',
    storeId: storeData[1].id,
  },
  ...gjCategoryData,
  ...ljCategoryData,
];

// Assign products to stores based on their category
const productData: any[] = [
  // Added 'any[]' for type compatibility with gjProductData
  // Electronics (Store 1)
  {
    sku: 'FP1v2',
    name: 'אוזניות ללא חוטים מבטלות רעש',
    description: 'חוויית צליל עמוק עם אוזניות פרימיום אלה.',
    price: 199.99,
    imageUrls: [
      'https://images.unsplash.com/photo-1496957961599-e35b69ef5d7c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=500&h=500&fit=crop',
    ],
    tags: ['New', 'Featured', 'Audio'],
    stockLevel: 50,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[0].id],
    isFeaturedInMarketplace: true,
  },
  {
    sku: 'FP2v2',
    name: 'שעון חכם סדרה 8',
    description: 'הישאר מחובר ועקוב אחר מטרות הכושר שלך בקלות.',
    price: 349.0,
    imageUrls: [
      'https://media.istockphoto.com/id/539215939/photo/smart-watch-displaying-apps-icons.webp?a=1&b=1&s=612x612&w=0&k=20&c=-xaY3cEkxpHYv7kbomdaX_MXrTVReTnqCfCQ_iKEgiw=',
      'https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12?w=300&h=200&fit=crop',
    ],
    tags: ['New', 'Featured', 'Wearable'],
    stockLevel: 25,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[0].id],
    isFeaturedInMarketplace: true,
  },
  {
    sku: 'FP3',
    name: 'רמקול בלוטות',
    description:
      'רמקול קומפקטי עם איכות צליל חזקה למוזיקה בדרכים.',
    price: 49.99,
    imageUrls: ['https://plus.unsplash.com/premium_photo-1677159499898-b061fb5bd2d7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8UG9ydGFibGUlMjBCbHVldG9vdGglMjBTcGVha2VyfGVufDB8fDB8fHww'],
    tags: ['Sale', 'Featured', 'Audio'],
    stockLevel: 40,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[0].id],
    isFeaturedInMarketplace: true,
  },
  {
    sku: 'FP4',
    name: 'טלוויזיה חכמה 4K אולטרה HD',
    description: 'איכות תמונה מדהימה עם תכונות חכמות.',
    price: 799.99,
    imageUrls: [
      'https://plus.unsplash.com/premium_photo-1683121217848-44dde7d393e6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8NEslMjBVbHRyYSUyMEhEJTIwU21hcnQlMjBUVnxlbnwwfHwwfHx8MA%3D%3D',
      'https://media.istockphoto.com/id/611294444/photo/uhd-4k-smart-tv-on-black-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=RQQnVLoUV9_tjUWEAe2h0BZTgJJxq-aqJTv9kICrvhY=',
      'https://images.unsplash.com/photo-1698047484467-9680294b55fd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzR8fDRLJTIwVWx0cmElMjBIRCUyMFNtYXJ0JTIwVFZ8ZW58MHx8MHx8fDA%3D',
      'https://plus.unsplash.com/premium_photo-1682274001252-cd39d7158ae3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8NEslMjBVbHRyYSUyMEhEJTIwU21hcnQlMjBUVnxlbnwwfHwwfHx8MA%3D%3D',
    ],
    tags: ['Featured', 'Home Entertainment'],
    stockLevel: 15,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[0].id],
  },
  {
    sku: 'FP5',
    name: 'מחשב נייד לגיימינג',
    description: 'מחשב נייד בעל ביצועים גבוהים לחובבי גיימינג.',
    price: 1299.0,
    imageUrls: ['https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8R2FtaW5nJTIwTGFwdG9wfGVufDB8fDB8fHww'],
    tags: ['New', 'Gaming'],
    stockLevel: 10,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[0].id],
  },

  // Apparel (Store 2)
  {
    sku: 'APPA-001',
    name: 'חולצת טי קלאסית מכותנה',
    description:
      'פריט חובה יומי נוח ואופנתי, זמין במגוון צבעים.',
    price: 24.99,
    imageUrls: [
      'https://images.unsplash.com/photo-1713881587420-113c1c43e28a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Q2xhc3NpYyUyMENvdHRvbiUyMFQtU2hpcnR8ZW58MHx8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1623658580851-3b25bf83b4ea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fENsYXNzaWMlMjBDb3R0b24lMjBULVNoaXJ0fGVufDB8fDB8fHww',
      'https://images.unsplash.com/photo-1633966887768-64f9a867bdba?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODh8fENsYXNzaWMlMjBDb3R0b24lMjBULVNoaXJ0fGVufDB8fDB8fHww',
    ],
    tags: ['Best Seller', 'Featured', 'Basics'],
    stockLevel: 0,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[4].id],
    isFeaturedInMarketplace: true,
    options: ['Size', 'Color'], // Define available options at the product level
    variants: [
      {
        sku: 'APPA-001-S-Red',
        options: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'Red' },
        ],
        price: 24.99,
        stockLevel: 10,
        imageUrl: 'https://picsum.photos/seed/APPA-001-S-Red/500/500',
      },
      {
        sku: 'APPA-001-M-Red',
        options: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Red' },
        ],
        price: 24.99,
        stockLevel: 15,
      },
      {
        sku: 'APPA-001-L-Red',
        options: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'Red' },
        ],
        price: 24.99,
        stockLevel: 12,
      },
      {
        sku: 'APPA-001-XL-Red',
        options: [
          { name: 'Size', value: 'XL' },
          { name: 'Color', value: 'Red' },
        ],
        price: 24.99,
        stockLevel: 8,
      },
      {
        sku: 'APPA-001-S-Blue',
        options: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'Blue' },
        ],
        price: 24.99,
        stockLevel: 20,
        imageUrl: 'https://picsum.photos/seed/APPA-001-S-Blue/500/500',
      },
      {
        sku: 'APPA-001-M-Blue',
        options: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Blue' },
        ],
        price: 24.99,
        stockLevel: 18,
      },
      {
        sku: 'APPA-001-L-Blue',
        options: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'Blue' },
        ],
        price: 24.99,
        stockLevel: 15,
      },
      {
        sku: 'APPA-001-XL-Blue',
        options: [
          { name: 'Size', value: 'XL' },
          { name: 'Color', value: 'Blue' },
        ],
        price: 24.99,
        stockLevel: 10,
      },
      {
        sku: 'APPA-001-S-Green',
        options: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'Green' },
        ],
        price: 24.99,
        stockLevel: 5,
        imageUrl: 'https://picsum.photos/seed/APPA-001-S-Green/500/500',
      },
      {
        sku: 'APPA-001-M-Green',
        options: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Green' },
        ],
        price: 24.99,
        stockLevel: 7,
      },
      {
        sku: 'APPA-001-L-Green',
        options: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'Green' },
        ],
        price: 24.99,
        stockLevel: 6,
      },
      {
        sku: 'APPA-001-XL-Green',
        options: [
          { name: 'Size', value: 'XL' },
          { name: 'Color', value: 'Green' },
        ],
        price: 24.99,
        stockLevel: 4,
      },
    ],
  },
  {
    sku: 'APPA-002',
    name: 'ג\'ינס דנימ סקיני פיט',
    description: 'ג\'ינס דנימ קלאסי סקיני פיט למראה מודרני.',
    price: 59.99,
    imageUrls: [
      'https://picsum.photos/seed/newAPPA-002a/500/500',
      'https://picsum.photos/seed/newAPPA-002b/500/500',
    ],
    tags: ['Menswear'],
    stockLevel: 0,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[4].id],
    isFeaturedInMarketplace: true,
    options: ['Waist', 'Inseam'],
    variants: [
      {
        sku: 'APPA-002-30-30',
        options: [
          { name: 'Waist', value: '30' },
          { name: 'Inseam', value: '30' },
        ],
        price: 59.99,
        stockLevel: 10,
      },
      {
        sku: 'APPA-002-30-32',
        options: [
          { name: 'Waist', value: '30' },
          { name: 'Inseam', value: '32' },
        ],
        price: 59.99,
        stockLevel: 8,
      },
      {
        sku: 'APPA-002-32-30',
        options: [
          { name: 'Waist', value: '32' },
          { name: 'Inseam', value: '30' },
        ],
        price: 59.99,
        stockLevel: 15,
      },
      {
        sku: 'APPA-002-32-32',
        options: [
          { name: 'Waist', value: '32' },
          { name: 'Inseam', value: '32' },
        ],
        price: 59.99,
        stockLevel: 12,
      },
      {
        sku: 'APPA-002-34-32',
        options: [
          { name: 'Waist', value: '34' },
          { name: 'Inseam', value: '32' },
        ],
        price: 59.99,
        stockLevel: 20,
      },
      {
        sku: 'APPA-002-34-34',
        options: [
          { name: 'Waist', value: '34' },
          { name: 'Inseam', value: '34' },
        ],
        price: 59.99,
        stockLevel: 18,
      },
      {
        sku: 'APPA-002-36-32',
        options: [
          { name: 'Waist', value: '36' },
          { name: 'Inseam', value: '32' },
        ],
        price: 59.99,
        stockLevel: 5,
      },
      {
        sku: 'APPA-002-36-34',
        options: [
          { name: 'Waist', value: '36' },
          { name: 'Inseam', value: '34' },
        ],
        price: 59.99,
        stockLevel: 7,
      },
    ],
  },
  {
    sku: 'APPA-003',
    name: 'הודי קל משקל',
    description: 'מושלם לשכבות או ערבים קרירים.',
    price: 45.0,
    imageUrls: ['https://picsum.photos/seed/newAPPA-003a/500/500'],
    tags: ['New', 'Casual'],
    stockLevel: 0,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[4].id],
    options: ['Size', 'Color'],
    variants: [
      {
        sku: 'APPA-003-S-Grey',
        options: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'Grey' },
        ],
        price: 45.0,
        stockLevel: 10,
      },
      {
        sku: 'APPA-003-M-Grey',
        options: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Grey' },
        ],
        price: 45.0,
        stockLevel: 15,
      },
      {
        sku: 'APPA-003-L-Grey',
        options: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'Grey' },
        ],
        price: 45.0,
        stockLevel: 12,
      },
      {
        sku: 'APPA-003-S-Black',
        options: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'Black' },
        ],
        price: 45.0,
        stockLevel: 20,
      },
      {
        sku: 'APPA-003-M-Black',
        options: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Black' },
        ],
        price: 45.0,
        stockLevel: 18,
      },
      {
        sku: 'APPA-003-L-Black',
        options: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'Black' },
        ],
        price: 45.0,
        stockLevel: 15,
      },
    ],
  },
  {
    sku: 'APPA-004',
    name: 'שמלת קיץ',
    description: 'שמלה זורמת ונוחה למזג אוויר חם.',
    price: 65.0,
    imageUrls: [
      'https://picsum.photos/seed/newAPPA-004a/500/500',
      'https://picsum.photos/seed/newAPPA-004b/500/500',
    ],
    tags: ['Womenswear', 'Sale'],
    stockLevel: 0,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[4].id],
    options: ['Size', 'Color'],
    variants: [
      {
        sku: 'APPA-004-XS-Floral',
        options: [
          { name: 'Size', value: 'XS' },
          { name: 'Color', value: 'Floral' },
        ],
        price: 65.0,
        stockLevel: 10,
      },
      {
        sku: 'APPA-004-S-Floral',
        options: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'Floral' },
        ],
        price: 65.0,
        stockLevel: 15,
      },
      {
        sku: 'APPA-004-M-Floral',
        options: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Floral' },
        ],
        price: 65.0,
        stockLevel: 12,
      },
      {
        sku: 'APPA-004-L-Floral',
        options: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'Floral' },
        ],
        price: 65.0,
        stockLevel: 8,
      },
      {
        sku: 'APPA-004-S-Yellow',
        options: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'Yellow' },
        ],
        price: 65.0,
        stockLevel: 20,
      },
      {
        sku: 'APPA-004-M-Yellow',
        options: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Yellow' },
        ],
        price: 65.0,
        stockLevel: 18,
      },
      {
        sku: 'APPA-004-L-Yellow',
        options: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'Yellow' },
        ],
        price: 65.0,
        stockLevel: 15,
      },
    ],
  },
  {
    sku: 'APPA-005',
    name: 'נעלי ריצה',
    description: 'נעלי ספורט קלות ותומכות לריצות שלך.',
    price: 89.99,
    imageUrls: [
      'https://picsum.photos/seed/APPA-005a/500/500',
      'https://picsum.photos/seed/APPA-005b/500/500',
      'https://picsum.photos/seed/APPA-005c/500/500',
    ],
    tags: ['Footwear', 'Sports'],
    stockLevel: 0,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[4].id, categoryData[5].id], // Assign to both Apparel and Sports
    options: ['Size (US)', 'Color'],
    variants: [
      {
        sku: 'APPA-005-8-Blue',
        options: [
          { name: 'Size (US)', value: '8' },
          { name: 'Color', value: 'Blue' },
        ],
        price: 89.99,
        stockLevel: 10,
      },
      {
        sku: 'APPA-005-9-Blue',
        options: [
          { name: 'Size (US)', value: '9' },
          { name: 'Color', value: 'Blue' },
        ],
        price: 89.99,
        stockLevel: 15,
      },
      {
        sku: 'APPA-005-10-Blue',
        options: [
          { name: 'Size (US)', value: '10' },
          { name: 'Color', value: 'Blue' },
        ],
        price: 89.99,
        stockLevel: 12,
      },
      {
        sku: 'APPA-005-11-Blue',
        options: [
          { name: 'Size (US)', value: '11' },
          { name: 'Color', value: 'Blue' },
        ],
        price: 89.99,
        stockLevel: 8,
      },
      {
        sku: 'APPA-005-8-Black',
        options: [
          { name: 'Size (US)', value: '8' },
          { name: 'Color', value: 'Black' },
        ],
        price: 89.99,
        stockLevel: 20,
      },
      {
        sku: 'APPA-005-9-Black',
        options: [
          { name: 'Size (US)', value: '9' },
          { name: 'Color', value: 'Black' },
        ],
        price: 89.99,
        stockLevel: 18,
      },
      {
        sku: 'APPA-005-10-Black',
        options: [
          { name: 'Size (US)', value: '10' },
          { name: 'Color', value: 'Black' },
        ],
        price: 89.99,
        stockLevel: 15,
      },
      {
        sku: 'APPA-005-11-Black',
        options: [
          { name: 'Size (US)', value: '11' },
          { name: 'Color', value: 'Black' },
        ],
        price: 89.99,
        stockLevel: 10,
      },
    ],
  },

  // Home Goods (Store 1)
  {
    sku: 'HOME-001',
    name: 'סט ספלי קפה קרמיקה (4)',
    description: 'התחל את היום שלך נכון עם סט עמיד של ספלים.',
    price: 39.99,
    imageUrls: ['https://images.unsplash.com/photo-1651936020103-1156d5390b25?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fENlcmFtaWMlMjBDb2ZmZWUlMjBNdWclMjBTZXR8ZW58MHx8MHx8fDA%3D'],
    tags: ['Kitchen', 'Gift Idea'],
    stockLevel: 80,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[1].id],
    isFeaturedInMarketplace: true,
  },
  {
    sku: 'HOME-002',
    name: 'נר ריחני יוקרתי',
    description: 'נר ריחני מרגיע של לבנדר ווניל בקנקן זכוכית.',
    price: 22.5,
    imageUrls: [
      'https://images.unsplash.com/photo-1707839568938-f9b50bb88454?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8THV4dXJ5JTIwU2NlbnRlZCUyMENhbmRsZXxlbnwwfHwwfHx8MA%3D%3D',
      'https://images.unsplash.com/photo-1707839568443-912e7206c726?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8THV4dXJ5JTIwU2NlbnRlZCUyMENhbmRsZXxlbnwwfHwwfHx8MA%3D%3D',
    ],
    tags: ['New', 'Home Decor'],
    stockLevel: 70,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[1].id],
  },
  {
    sku: 'HOME-003',
    name: 'שמיכת זריקה רכה',
    description: 'שמיכה רכה ונוחה לספה או למיטה.',
    price: 49.99,
    imageUrls: ['https://images.unsplash.com/photo-1640794334953-47993ef59351?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8UGx1c2glMjBUaHJvdyUyMEJsYW5rZXR8ZW58MHx8MHx8fDA%3D'],
    tags: ['Comfort', 'Home Decor'],
    stockLevel: 60,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[1].id],
  },
  {
    sku: 'HOME-004',
    name: 'סט כלי בישול פלדת אל-חלד',
    description: 'סט כלי בישול עמיד בן 10 חלקים למטבח שלך.',
    price: 149.99,
    imageUrls: [
      'https://plus.unsplash.com/premium_photo-1664391825760-17aacf4cb3b4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U3RhaW5sZXNzJTIwU3RlZWwlMjBDb29rd2FyZSUyMFNldHxlbnwwfHwwfHx8MA%3D%3D',
      'https://images.unsplash.com/photo-1760537440650-37ccbfe91d2c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fFN0YWlubGVzcyUyMFN0ZWVsJTIwQ29va3dhcmUlMjBTZXR8ZW58MHx8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1596411912876-0714b94a68bd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fFN0YWlubGVzcyUyMFN0ZWVsJTIwQ29va3dhcmUlMjBTZXR8ZW58MHx8MHx8fDA%3D',
    ],
    tags: ['Kitchen', 'Featured'],
    stockLevel: 20,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[1].id],
  },
  {
    sku: 'HOME-005',
    name: 'הדפס אומנות קיר',
    description: 'הדפס אומנות אבסטרקטית לשיפור המרחב המחיה שלך.',
    price: 75.0,
    imageUrls: ['https://plus.unsplash.com/premium_photo-1723759219493-6287376860f0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8V2FsbCUyMEFydCUyMFByaW50fGVufDB8fDB8fHww'],
    tags: ['Home Decor'],
    stockLevel: 35,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[1].id],
  },

  // Books (Store 1)
  {
    sku: 'BOOK-001',
    name: 'ספריית חצות',
    description: 'רומן מרתק על בחירות וחרטות.',
    price: 15.99,
    imageUrls: ['https://images.unsplash.com/photo-1563135629-4850a3517799?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fFRoZSUyME1pZG5pZ2h0JTIwTGlicmFyeXxlbnwwfHwwfHx8MA%3D%3D'],
    tags: ['Featured', 'Fiction', 'Best Seller'],
    stockLevel: 30,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[2].id],
    isFeaturedInMarketplace: true,
  },
  {
    sku: 'BOOK-002',
    name: 'ספר תינוקות',
    description: 'מדריך תמציתי ונגיש לקוסמוס.',
    price: 12.99,
    imageUrls: ['https://images.unsplash.com/photo-1589123066574-165d71809555?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8QmFiaWVzJTIwYm9va3xlbnwwfHwwfHx8MA%3D%3D'],
    tags: ['Non-Fiction', 'Science'],
    stockLevel: 45,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[2].id],
  },
  {
    sku: 'BOOK-003',
    name: 'ספר בישול: מתכונים פשוטים',
    description: 'מתכונים קלים וטעימים לבישול יומיומי.',
    price: 25.0,
    imageUrls: ['https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q29va2Jvb2slM0ElMjBTaW1wbGUlMjBSZWNpcGVzfGVufDB8fDB8fHww'],
    tags: ['Cooking', 'Gift Idea'],
    stockLevel: 50,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[2].id],
  },
  {
    sku: 'BOOK-004',
    name: "ספר תמונות לילדים",
    description: 'סיפור מאויר יפה לקוראים צעירים.',
    price: 9.99,
    imageUrls: ['hhttps://images.unsplash.com/photo-1616802099190-5a4485319df6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q2hpbGRyZW4ncyUyMFBpY3R1cmUlMjBCb29rfGVufDB8fDB8fHww'],
    tags: ['Children', 'Illustrated'],
    stockLevel: 100,
    isActive: true,
    storeId: storeData[0].id,
    categoryIds: [categoryData[2].id],
  },

  // Sports & Outdoors (Store 2)
  {
    sku: 'SPRT-001',
    name: 'מחצלת יוגה פרימיום',
    description: 'מחצלת יוגה עבה במיוחד, נוחה ולא מחליקה.',
    price: 34.99,
    imageUrls: [
      'https://picsum.photos/seed/SPRT-001a/500/500',
      'https://picsum.photos/seed/SPRT-001b/500/500',
    ],
    tags: ['Best Seller', 'Featured', 'Fitness'],
    stockLevel: 90,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[5].id],
    isFeaturedInMarketplace: true,
  },
  {
    sku: 'SPRT-002',
    name: 'תיק גב טיולים (40 ליטר)',
    description: 'תיק גב עמיד ומרווח לטיולים יומיים או נסיעות.',
    price: 79.99,
    imageUrls: [
      'https://picsum.photos/seed/SPRT-002a/500/500',
      'https://picsum.photos/seed/SPRT-002b/500/500',
      'https://picsum.photos/seed/SPRT-002c/500/500',
    ],
    tags: ['Hiking', 'Travel', 'New'],
    stockLevel: 40,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[5].id],
  },
  {
    sku: 'SPRT-003',
    name: 'סט רצועות התנגדות',
    description: 'רצועות התנגדות מגוונות לאימונים ביתיים.',
    price: 19.99,
    imageUrls: ['https://picsum.photos/seed/SPRT-003a/500/500'],
    tags: ['Fitness', 'Workout'],
    stockLevel: 110,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[5].id],
  },
  {
    sku: 'SPRT-004',
    name: 'בקבוק מים מבודד',
    description: 'שומר על משקאות קרים למשך 24 שעות או חמים למשך 12.',
    price: 24.99,
    imageUrls: [
      'https://picsum.photos/seed/SPRT-004a/500/500',
      'https://picsum.photos/seed/SPRT-004b/500/500',
    ],
    tags: ['Hydration', 'Outdoor'],
    stockLevel: 150,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[5].id],
  },

  // Toys & Games (Store 2)
  {
    sku: 'TOY-001',
    name: 'סט קוביות בנייה עץ (100 חלקים)',
    description:
      'קוביות בנייה עץ קלאסיות למשחק יצירתי וחינוכי.',
    price: 45.99,
    imageUrls: ['https://picsum.photos/seed/TOY-001a/500/500'],
    tags: ['Educational', 'Kids'],
    stockLevel: 150,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[6].id],
  },
  {
    sku: 'TOY-002',
    name: 'משחק לוח אסטרטגיה',
    description: 'משחק לוח מרתק לערב משפחתי.',
    price: 39.99,
    imageUrls: [
      'https://picsum.photos/seed/TOY-002a/500/500',
      'https://picsum.photos/seed/TOY-002b/500/500',
    ],
    tags: ['Family Fun', 'Strategy'],
    stockLevel: 60,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[6].id],
  },
  {
    sku: 'TOY-003',
    name: 'דובי פלוש',
    description: 'בן לוויה דובי רך ומחבק.',
    price: 19.99,
    imageUrls: ['https://picsum.photos/seed/TOY-003a/500/500'],
    tags: ['Gift Idea', 'Kids'],
    stockLevel: 95,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[6].id],
  },
  {
    sku: 'TOY-004',
    name: 'מכונית שלט רחוק',
    description: 'מכונית שלט רחוק מהירה וכיפית למשחק בפנים/חוץ.',
    price: 29.99,
    imageUrls: [
      'https://picsum.photos/seed/TOY-004a/500/500',
      'https://picsum.photos/seed/TOY-004b/500/500',
    ],
    tags: ['Outdoor', 'Kids', 'Sale'],
    stockLevel: 70,
    isActive: true,
    storeId: storeData[1].id,
    categoryIds: [categoryData[6].id],
  },
  ...gjProductData,
  ...ljProductData,
];

// Define which product SKUs are used in the carousel for easier lookup
const carouselProductSkus = [
  'FP1v2',
  'HOME-001',
  'BOOK-001',
  'APPA-001',
  'BOOK-004',
  ...gjCarouselItemData
    .map((item) =>
      item.linkUrl?.startsWith('product_sku:')
        ? item.linkUrl.split(':')[1]
        : '',
    )
    .filter((sku) => sku), // Extract SKUs from Green Jewelry carousel
  ...ljCarouselItemData
    .map((item) =>
      item.linkUrl?.startsWith('product_sku:')
        ? item.linkUrl.split(':')[1]
        : '',
    )
    .filter((sku) => sku), // Extract SKUs from Luxury Jewelry carousel
];

// Placeholder for carousel data - will be populated after fetching product IDs
let carouselData: Omit<CarouselItem, 'id' | 'store'>[] = [];

// --- User Data (will be populated inside bootstrap) ---
let userData: any[] = []; // Will hold final user data with hash
const saltRounds = 10;
const userPassword = 'password123'; // Simple password for seeding
const gjUserPassword = 'passwordGJ123'; // Simple password for Green Jewelry seeding

// Define user structure without hash initially
const baseUserData = [
  {
    id: 'a1b2c3d4-e5f6-7777-8888-9999aaaaabbb',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['customer'] as ('customer' | 'manager' | 'admin')[],
    profilePictureUrl: 'https://picsum.photos/seed/john.doe/200/200',
  }, // Use valid UUID
  {
    id: 'b1c2d3e4-f5a6-8888-9999-aaaaabbbbccc',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    roles: ['customer'] as ('customer' | 'manager' | 'admin')[],
    profilePictureUrl: 'https://picsum.photos/seed/jane.smith/200/200',
  }, // Use valid UUID
  {
    id: 'c1d2e3f4-a5b6-9999-aaaa-bbbbccccdddd',
    email: 'A@A.com',
    firstName: 'Admin',
    lastName: 'User',
    roles: ['manager', 'customer'] as ('customer' | 'manager' | 'admin')[],
    profilePictureUrl: 'https://picsum.photos/seed/admin.user/200/200',
  }, // Manager User
  ...gjUserData.map((u) => ({
    ...u,
    roles: u.roles,
  })), // Add Green Jewelry users (profilePictureUrl will be handled in green-jewelry.data.ts)
  ...ljUserData.map((u) => ({
    ...u,
    roles: u.roles,
  })), // Add Luxury Jewelry users (profilePictureUrl will be handled in luxury-jewelry.data.ts)
];

// --- Address Data ---
const addressData = [
  // John Doe Addresses
  {
    userId: baseUserData[0].id,
    fullName: 'John Doe',
    street1: '123 Main St',
    city: 'Anytown',
    postalCode: '90210',
    country: 'USA',
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
  {
    userId: baseUserData[0].id,
    fullName: 'John Doe Work',
    street1: '456 Business Ave',
    street2: 'Suite 100',
    city: 'Workville',
    postalCode: '90211',
    country: 'USA',
  },
  // Jane Smith Address
  {
    userId: baseUserData[1].id,
    fullName: 'Jane Smith',
    street1: '789 Lake Rd',
    city: 'Laketown',
    postalCode: '10001',
    country: 'USA',
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
  ...gjAddressData, // Add Green Jewelry addresses
  ...ljAddressData, // Add Luxury Jewelry addresses
];

// --- Order Data (Placeholder - needs product IDs) ---
const orderData: any[] = []; // Will populate after fetching products
const orderItemData: any[] = []; // Will populate after fetching products

// --- Wishlist Data (Placeholder - needs product IDs) ---
const wishlistData: any[] = []; // Will populate after fetching products
const wishlistItemData: any[] = []; // Will populate after fetching products

// --- About Content Data ---
const aboutContentData = [
  // Awesome Gadgets & Goods
  {
    storeId: storeData[0].id,
    title: 'אודותינו',
    content:
      'גאדג\'טים ומוצרים מעולים היא חנות מקוונת המתמחה בגאדג\'טים חכמים ומוצרים נבחרים לחיים נוחים ומענגים יותר. החנות מציעה מגוון רחב של מוצרי טכנולוגיה מתקדמים, אביזרי אודיו, מכשירי בית חכם, מוצרי מטבח ואורח חיים באיכות גבוהה. כל המוצרים נבחרים בקפידה לשלב חדשנות, עיצוב ופונקציונליות – לחוויית קניות חכמה ומעודכנת.',
    imageUrl: 'https://images.unsplash.com/photo-1597664607810-e59e0318e775?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXdlc29tZSUyMGdhZGdldHN8ZW58MHx8MHx8fDA%3D',
  },
  {
    storeId: storeData[0].id,
    title: 'Shipping Policy',
    content:
      'We offer fast and reliable shipping on all orders. Standard shipping typically takes 3-5 business days within the country. Express options are available for urgent deliveries. International shipping is provided to select countries with delivery times ranging from 7-14 business days. All shipments are tracked and insured. Free shipping is available on orders over $50.',
    imageUrl: undefined,
  },
  {
    storeId: storeData[0].id,
    title: 'Return Policy',
    content:
      'We want you to be completely satisfied with your purchase. If you are not happy with your item, you can return it within 30 days of delivery for a full refund or exchange. Items must be in their original condition and packaging. Return shipping costs are covered by us for defective items. For all other returns, customers are responsible for return shipping costs.',
    imageUrl: undefined,
  },
  {
    storeId: storeData[0].id,
    title: 'Privacy Policy',
    content:
      'We are committed to protecting your privacy. We collect personal information only for order processing and customer service. Your data is securely stored and never shared with third parties without your consent. We use industry-standard encryption and follow all relevant data protection regulations. You can request to view, update, or delete your personal information at any time.',
    imageUrl: undefined,
  },
  {
    storeId: storeData[0].id,
    title: 'Terms of Service',
    content:
      'By using our website and services, you agree to our terms. All products are sold as-is with warranty coverage as specified by manufacturers. We reserve the right to modify prices and availability without notice. Intellectual property on our site belongs to Awesome Gadgets & Goods. Any misuse of our services may result in account suspension.',
    imageUrl: undefined,
  },
  // Fashion & Fun Zone
  {
    storeId: storeData[1].id,
    title: 'About Us',
    content:
      'Fashion & Fun Zone is your ultimate destination for stylish apparel and entertaining products. We curate the latest trends in clothing, accessories, and fun items for all ages. From trendy fashion pieces to toys and sporting goods, our collection combines quality, style, and enjoyment to make every day more fun and fashionable.',
    imageUrl: 'https://picsum.photos/seed/about-fashion/800/400',
  },
  {
    storeId: storeData[1].id,
    title: 'Shipping Policy',
    content:
      'Fashion & Fun Zone provides reliable shipping services to ensure your orders arrive quickly and safely. Domestic shipping typically takes 2-4 business days, with express options available. We ship internationally to over 50 countries, with delivery times of 5-10 business days. All packages are carefully packaged and tracked. Free shipping applies to orders over $75.',
    imageUrl: undefined,
  },
  {
    storeId: storeData[1].id,
    title: 'Return Policy',
    content:
      'Customer satisfaction is our priority at Fashion & Fun Zone. We offer a hassle-free 30-day return policy on all items. Returns must be in original condition with tags attached. We provide prepaid return labels for easy returns. Exchanges are processed within 5-7 business days. Refunds are issued to the original payment method within 3-5 business days after receipt.',
    imageUrl: undefined,
  },
  {
    storeId: storeData[1].id,
    title: 'Privacy Policy',
    content:
      'Your privacy matters to us. We collect information only necessary for processing orders and improving our services. Personal data is encrypted and stored securely. We comply with all privacy laws and never sell your information. You have the right to access, correct, or delete your data. Contact us for any privacy-related concerns.',
    imageUrl: undefined,
  },
  {
    storeId: storeData[1].id,
    title: 'Terms of Service',
    content:
      'Welcome to Fashion & Fun Zone. By shopping with us, you agree to these terms. Products are sold with manufacturer warranties. Prices and availability are subject to change. Our intellectual property is protected. Accounts may be terminated for violations of our policies. Disputes are resolved through our customer service team.',
    imageUrl: undefined,
  },
  gjAboutContentData,
  ljAboutContentData,
];

// --- Testimonial Data ---
const testimonialData = [
  {
    storeId: storeData[0].id,
    author: 'Alice W.',
    quote:
      'Amazing selection of gadgets! Found exactly what I was looking for.',
    date: new Date('2024-05-01'),
    rating: 5,
  },
  {
    storeId: storeData[0].id,
    author: 'Bob F.',
    quote: 'Fast shipping and great customer service. Highly recommend!',
    date: new Date('2024-04-15'),
    rating: 4,
  },
  {
    storeId: storeData[1].id,
    author: 'Charlie M.',
    quote: 'Love the trendy clothes and fun toys for my kids.',
    date: new Date('2024-05-10'),
    rating: 5,
  },
  ...gjTestimonialData,
  ...ljTestimonialData,
];
// --- FAQ Data ---
const faqData = [
  {
    storeId: storeData[0].id,
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy on most items.',
  },
  {
    storeId: storeData[0].id,
    question: 'How long does shipping take?',
    answer: 'Standard shipping usually takes 3-5 business days.',
  },
  {
    storeId: storeData[1].id,
    question: 'Do you offer international shipping?',
    answer: 'Yes, we ship to select international destinations.',
  },
  ...gjFaqData,
  ...ljFaqData,
];

// --- Review Data (Placeholder - needs product and user IDs) ---
const reviewData: any[] = []; // Will populate after fetching products and users

// --- Promo Code Data ---
const promoCodeData: Partial<PromoCodeEntity>[] = [
  {
    code: 'SUMMER20',
    discountType: 'percentage',
    discountValue: 20,
    isActive: true,
    validTo: new Date('2025-08-31'),
  },
  {
    code: 'SAVE10',
    discountType: 'fixed',
    discountValue: 10,
    isActive: true,
    minCartValue: 50,
  },
  {
    code: 'STORE1SPECIFIC',
    discountType: 'percentage',
    discountValue: 15,
    isActive: true,
    storeId: storeData[0].id,
  },
  {
    code: 'EXPIREDCODE',
    discountType: 'fixed',
    discountValue: 5,
    isActive: false,
    validTo: new Date('2024-01-01'),
  },
  ...gjPromoCodeData.map((pc) => ({
    ...pc,
    validTo: pc.validTo ? new Date(pc.validTo) : undefined,
    validFrom: pc.validFrom ? new Date(pc.validFrom) : undefined,
  })), // Add Green Jewelry promo codes
  ...ljPromoCodeData.map((pc) => ({
    ...pc,
    validTo: pc.validTo ? new Date(pc.validTo) : undefined,
    validFrom: pc.validFrom ? new Date(pc.validFrom) : undefined,
  })), // Add Luxury Jewelry promo codes
];

async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Starting database seeding process...');

  // Create a standalone application context
  const appContext = await NestFactory.createApplicationContext(AppModule);

  // Get repository instances using DataSource
  const dataSource = appContext.get(DataSource);
  const storeRepository = dataSource.getRepository(StoreEntity);
  const categoryRepository = dataSource.getRepository(CategoryEntity);
  const productRepository = dataSource.getRepository(ProductEntity);
  const productVariantRepository =
    dataSource.getRepository(ProductVariantEntity);
  const userRepository = dataSource.getRepository(UserEntity);
  const addressRepository = dataSource.getRepository(AddressEntity);
  const orderRepository = dataSource.getRepository(OrderEntity);
  const orderItemRepository = dataSource.getRepository(OrderItemEntity);
  const wishlistRepository = dataSource.getRepository(WishlistEntity);
  const wishlistItemRepository = dataSource.getRepository(WishlistItemEntity);
  const carouselRepository = dataSource.getRepository(CarouselItem);
  const reviewRepository = dataSource.getRepository(ReviewEntity);
  const faqRepository = dataSource.getRepository(FaqEntity);
  const aboutContentRepository = dataSource.getRepository(AboutContentEntity);
  const testimonialRepository = dataSource.getRepository(TestimonialEntity);
  const promoCodeRepository = dataSource.getRepository(PromoCodeEntity);
  const shippingMethodRepository =
    dataSource.getRepository(ShippingMethodEntity); // Get ShippingMethod repository
  const creditCardRepository = dataSource.getRepository(CreditCardEntity);

  try {
    // --- Clear existing data (order matters due to foreign keys) ---
    logger.log('Clearing existing data...');
    await reviewRepository.delete({});
    await orderItemRepository.delete({});
    await orderRepository.delete({});
    await wishlistItemRepository.delete({});
    await wishlistRepository.delete({});
    await shippingMethodRepository.delete({}); // Clear shipping methods
    await addressRepository.delete({});
    await promoCodeRepository.delete({});
    await creditCardRepository.delete({});
    await productVariantRepository.delete({});
    await productRepository.delete({});
    await categoryRepository.delete({});
    await carouselRepository.delete({});
    await faqRepository.delete({});
    await aboutContentRepository.delete({});
    await testimonialRepository.delete({});
    await storeRepository.delete({});
    await userRepository.delete({}); // Ensure users are cleared before addresses that might reference them
    logger.log('Existing data cleared.');

    // --- Seed Stores ---
    logger.log('Seeding stores...');
    const storeUpsertResult = await storeRepository.upsert(storeData, ['id']);
    logger.log(
      `Stores seeded/updated: ${storeUpsertResult.raw?.length || storeUpsertResult.generatedMaps?.length || 'N/A (check upsert result)'}`,
    );
    const storeCount = await storeRepository.count();
    logger.log(`Total stores in DB after seeding: ${storeCount}`);

    // --- Seed Categories ---
    logger.log('Seeding categories...');
    const categorySaveResult = await categoryRepository.save(categoryData);
    logger.log(
      `Categories seeded: ${categorySaveResult.length}`,
    );
    const categoryCount = await categoryRepository.count();
    logger.log(`Total categories in DB after seeding: ${categoryCount}`);

    // --- Seed Products and Variants ---
    logger.log('Seeding products and variants...');
    const productsToSave: ProductEntity[] = [];
    for (const product of productData) {
      const { categoryIds, variants: variantData, ...productDetails } = product;
      const productEntityInstance = productRepository.create(
        productDetails as Partial<ProductEntity>,
      );

      if (categoryIds && categoryIds.length > 0) {
        const categories = await categoryRepository.findBy({
          id: In(categoryIds),
        });
        productEntityInstance.categories = categories;
      }

      if (variantData && variantData.length > 0) {
        productEntityInstance.variants = variantData.map((variant) =>
          productVariantRepository.create(
            variant as Partial<ProductVariantEntity>,
          ),
        );
      }
      productsToSave.push(productEntityInstance);
    }

    await productRepository.save(productsToSave);
    const productCount = await productRepository.count();
    const variantCount = await productVariantRepository.count();
    logger.log(`Total products in DB after seeding: ${productCount}`);
    logger.log(`Total variants in DB after seeding: ${variantCount}`);

    // Fetch some products to use in orders/wishlists/reviews (ensure variants are loaded if needed)
    const productsStore1 = await productRepository.find({
      where: { storeId: storeData[0].id },
      take: 5,
      relations: ['variants'],
    }); // Fetch more products for reviews
    const productsStore2 = await productRepository.find({
      where: { storeId: storeData[1].id },
      take: 5,
      relations: ['variants'],
    }); // Fetch more products for reviews
    if (productsStore1.length < 3 || productsStore2.length < 3) {
      // Adjusted check
      throw new Error(
        'Not enough products found in stores to seed orders/wishlists/reviews.',
      );
    }

    // --- Fetch Product IDs for Carousel Links ---
    logger.log('Fetching product IDs for carousel links...');
    const productsForCarousel = await productRepository.find({
      where: { sku: In(carouselProductSkus) },
      select: ['id', 'sku'], // Select only necessary fields
    });

    const skuToIdMap = new Map<string, string>();
    productsForCarousel.forEach((p) => skuToIdMap.set(p.sku, p.id));
    logger.log(
      `Mapped SKUs to IDs: ${JSON.stringify(Object.fromEntries(skuToIdMap))}`,
    );

    // --- Build Carousel Data with Correct Product IDs ---
    const genericCarouselData = [
      // Store 1: Awesome Gadgets & Goods
      {
        imageUrl: 'https://plus.unsplash.com/premium_photo-1679513691474-73102089c117?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8V2lyZWxlc3MlMjBIZWFkcGhvbmVzfGVufDB8fDB8fHww',
        altText: 'Promotion: Wireless Headphones',
        linkUrl: skuToIdMap.get('FP1v2'),
        storeId: storeData[0].id,
      },
      {
        imageUrl: 'https://plus.unsplash.com/premium_photo-1726848084754-8045e048c62b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fENvZmZlZSUyME11ZyUyMFNldHxlbnwwfHwwfHx8MA%3D%3D',
        altText: 'Promotion: Coffee Mug Set',
        linkUrl: skuToIdMap.get('HOME-001'),
        storeId: storeData[0].id,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1678138458795-793494b64ea7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fEZlYXR1cmVkJTIwQm9vayUzQSUyMFRoZSUyME1pZG5pZ2h0JTIwTGlicmFyeXxlbnwwfHwwfHx8MA%3D%3D',
        altText: 'Featured Book: The Midnight Library',
        linkUrl: skuToIdMap.get('BOOK-001'),
        storeId: storeData[0].id,
      },
      // Store 2: Fashion & Fun Zone
      {
        imageUrl: 'https://picsum.photos/seed/newcarousel1-store2/1920/400',
        altText: 'Featured: Classic Cotton T-Shirt',
        linkUrl: skuToIdMap.get('APPA-001'),
        storeId: storeData[1].id,
      },
      {
        imageUrl: 'https://picsum.photos/seed/newcarousel2-store2/1920/400',
        altText: 'Featured: Premium Yoga Mat',
        linkUrl: skuToIdMap.get('SPRT-001'),
        storeId: storeData[1].id,
      },
    ];

    const greenJewelryCarouselData = gjCarouselItemData.map((item) => {
      const sku = item.linkUrl?.startsWith('product_sku:')
        ? item.linkUrl.split(':')[1]
        : undefined;
      const productId = sku ? skuToIdMap.get(sku) : undefined;
      return {
        imageUrl: item.imageUrl,
        altText: item.altText,
        linkUrl: productId, // Use resolved product ID
        storeId: item.storeId,
      };
    });

    const luxuryJewelryCarouselData = ljCarouselItemData.map((item) => {
      const sku = item.linkUrl?.startsWith('product_sku:')
        ? item.linkUrl.split(':')[1]
        : undefined;
      const productId = sku ? skuToIdMap.get(sku) : undefined;
      return {
        imageUrl: item.imageUrl,
        altText: item.altText,
        linkUrl: productId, // Use resolved product ID
        storeId: item.storeId,
      };
    });

    carouselData = [...genericCarouselData, ...greenJewelryCarouselData, ...luxuryJewelryCarouselData].filter(
      (item) => !!item.linkUrl && !!item.storeId,
    );

    // --- Seed Carousel Items ---
    logger.log('Seeding carousel items...');
    // Clear existing items for the seeded stores first to prevent duplicates on re-run
    await carouselRepository.delete({
      storeId: In(storeData.map((s) => s.id)),
    });
    logger.log(`Cleared existing carousel items for seeded stores.`);

    if (carouselData.length > 0) {
      const createdCarouselItems = carouselRepository.create(carouselData);
      await carouselRepository.save(createdCarouselItems);
      logger.log(`Saved ${createdCarouselItems.length} new carousel items.`);
    } else {
      logger.log(
        'No carousel items to save (possibly due to missing product IDs).',
      );
    }
    const carouselCount = await carouselRepository.count();
    logger.log(`Total carousel items in DB after seeding: ${carouselCount}`);

    // --- Generate User Hash and Prepare User Data ---
    logger.log('Preparing user data...');
    const genericUserPasswordHash = await bcrypt.hash(userPassword, saltRounds);
    const gjUserPasswordHash = await bcrypt.hash(gjUserPassword, saltRounds); // Hash for GJ users

    userData = await Promise.all(
      baseUserData.map(async (userSeedData: any) => {
        const isGjUser = gjUserData.some((gjU) => gjU.id === userSeedData.id);
        let finalPasswordHash: string;

        if (isGjUser) {
          // This user is from gjUserData.
          // Their 'passwordHash' field from the import is a placeholder string.
          // We will hash the predefined 'gjUserPassword' for them.
          finalPasswordHash = await bcrypt.hash(gjUserPassword, saltRounds);
        } else {
          // This user is one of the original generic users.
          // genericUserPasswordHash is already hashed.
          finalPasswordHash = genericUserPasswordHash;
        }

        // Construct the final user object for the database.
        // Destructure to get all properties except any existing 'passwordHash' (which might be the placeholder or undefined).
        const { passwordHash, ...userFields } = userSeedData;
        return { ...userFields, passwordHash: finalPasswordHash };
      }),
    );

    // --- Seed Users ---
    logger.log('Seeding users...');
    await userRepository.upsert(userData, ['id']);
    const userCount = await userRepository.count();
    logger.log(`Total users in DB after seeding: ${userCount}`);

    // --- Clear Dependent Data First ---
    // This needs to be more comprehensive if we are re-running seeds for specific stores or all.
    // For now, it clears based on all users in the combined userData.
    logger.log(
      'Clearing existing orders, wishlists, and addresses for seeded users...',
    );
    const allUserIds = userData.map((u) => u.id);
    await orderRepository.delete({ user: { id: In(allUserIds) } });
    await wishlistRepository.delete({ user: { id: In(allUserIds) } });
    await addressRepository.delete({ user: { id: In(allUserIds) } });

    // --- Seed Addresses ---
    logger.log('Seeding addresses...');
    const addressEntities = addressRepository.create(
      addressData.map((addr) => ({ ...addr, user: { id: addr.userId } })),
    );
    await addressRepository.save(addressEntities);
    const addressCount = await addressRepository.count();
    logger.log(`Total addresses in DB after seeding: ${addressCount}`);
    const johnsDefaultAddress = addressEntities.find(
      (a) => a.user?.id === baseUserData[0].id && a.isDefaultShipping,
    ); // Check against original baseUserData for this specific logic

    // --- Seed Orders ---
    logger.log('Seeding orders...');
    // Deletion moved above address seeding

    if (johnsDefaultAddress) {
      const order1Product1 = productsStore1[0];
      const order1Product2 = productsStore1[1];
      const order1Subtotal =
        order1Product1.price * 1 + order1Product2.price * 2;
      const order1Shipping = 5.99;
      const order1Tax = order1Subtotal * 0.08;
      const order1Total = order1Subtotal + order1Shipping + order1Tax;

      const order1 = orderRepository.create({
        orderReference: `ORD-${Date.now()}-001`,
        user: { id: userData[0].id },
        store: { id: storeData[0].id },
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        subtotal: order1Subtotal,
        shippingCost: order1Shipping,
        taxAmount: order1Tax,
        totalAmount: order1Total,
        shippingAddress: johnsDefaultAddress,
        shippingMethod: 'Standard Shipping',
        trackingNumber: '1Z999AA10123456789',
        items: [
          orderItemRepository.create({
            product: { id: order1Product1.id },
            quantity: 1,
            pricePerUnit: order1Product1.price,
            productName: order1Product1.name,
          }),
          orderItemRepository.create({
            product: { id: order1Product2.id },
            quantity: 2,
            pricePerUnit: order1Product2.price,
            productName: order1Product2.name,
          }),
        ],
      });

      const order2Product1 = productsStore1[2];
      const order2Subtotal = order2Product1.price * 1;
      const order2Shipping = 0;
      const order2Tax = order2Subtotal * 0.08;
      const order2Total = order2Subtotal + order2Shipping + order2Tax;

      const order2 = orderRepository.create({
        orderReference: `ORD-${Date.now()}-002`,
        user: { id: userData[0].id },
        store: { id: storeData[0].id },
        orderDate: new Date(Date.now() - 86400000 * 5),
        status: OrderStatus.SHIPPED,
        paymentStatus: PaymentStatus.PAID,
        subtotal: order2Subtotal,
        shippingCost: order2Shipping,
        taxAmount: order2Tax,
        totalAmount: order2Total,
        shippingAddress: johnsDefaultAddress,
        shippingMethod: 'Free Shipping',
        trackingNumber: 'TRACK-ABC-XYZ',
        items: [
          orderItemRepository.create({
            product: { id: order2Product1.id },
            quantity: 1,
            pricePerUnit: order2Product1.price,
            productName: order2Product1.name,
          }),
        ],
      });

      const order3Product1 = productsStore2[0]; // Product from store 2
      const order3Subtotal = order3Product1.price * 3;
      const order3Shipping = 7.5;
      const order3Tax = order3Subtotal * 0.08;
      const order3Total = order3Subtotal + order3Shipping + order3Tax;

      const order3 = orderRepository.create({
        orderReference: `ORD-${Date.now()}-003`,
        user: { id: userData[1].id },
        store: { id: storeData[1].id },
        orderDate: new Date(Date.now() - 86400000 * 10),
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PAID,
        subtotal: order3Subtotal,
        shippingCost: order3Shipping,
        taxAmount: order3Tax,
        totalAmount: order3Total,
        shippingAddress: addressEntities.find(
          (a) => a.user?.id === userData[1].id,
        ),
        shippingMethod: 'Express Shipping',
        trackingNumber: 'EXP-123-456',
        items: [
          orderItemRepository.create({
            product: { id: order3Product1.id },
            quantity: 3,
            pricePerUnit: order3Product1.price,
            productName: order3Product1.name,
          }),
        ],
      });

      await orderRepository.save([order1, order2, order3]);
      logger.log(
        `Created sample orders: ${order1.orderReference}, ${order2.orderReference}, ${order3.orderReference}`,
      );
    } else {
      logger.warn(
        'Skipping order seeding as default address for John Doe was not found.',
      );
    }
    const orderCount = await orderRepository.count();
    logger.log(`Total orders in DB after seeding: ${orderCount}`);

    // --- Seed Wishlists ---
    logger.log('Seeding wishlists...');
    // Deletion moved above address seeding

    const wishlist1Product1 = productsStore2[0];

    const wishlist1 = wishlistRepository.create({
      user: { id: userData[1].id },
      store: { id: storeData[1].id },
      items: [
        wishlistItemRepository.create({
          product: { id: wishlist1Product1.id },
        }),
      ],
    });
    await wishlistRepository.save(wishlist1);
    logger.log(
      `Created sample wishlist for user ${userData[1].id} in store ${storeData[1].id}`,
    );
    const wishlistCount = await wishlistRepository.count();
    logger.log(`Total wishlists in DB after seeding: ${wishlistCount}`);

    // --- Seed About Content ---
    logger.log('Seeding about content...');
    const aboutContentEntities =
      aboutContentRepository.create(aboutContentData);
    await aboutContentRepository.save(aboutContentEntities);
    const aboutContentCount = await aboutContentRepository.count();
    logger.log(
      `Total about content entries in DB after seeding: ${aboutContentCount}`,
    );

    // --- Seed Testimonials ---
    logger.log('Seeding testimonials...');
    const testimonialEntities = testimonialRepository.create(testimonialData);
    await testimonialRepository.save(testimonialEntities);
    const testimonialCount = await testimonialRepository.count();
    logger.log(`Total testimonials in DB after seeding: ${testimonialCount}`);

    // --- Seed FAQ ---
    logger.log('Seeding FAQ...');
    const faqEntities = faqRepository.create(faqData);
    await faqRepository.save(faqEntities);
    const faqCount = await faqRepository.count();
    logger.log(`Total FAQ entries in DB after seeding: ${faqCount}`);

    // --- Seed Reviews ---
    logger.log('Seeding reviews...');
    // Get some products and users to associate with reviews
    const productToReview1 = productsStore1[0]; // Product from store 1
    const productToReview2 = productsStore2[1]; // Product from store 2
    const userReviewer1 = userData[0]; // John Doe
    const userReviewer2 = userData[1]; // Jane Smith

    const reviewEntities = reviewRepository.create([
      {
        product: { id: productToReview1.id },
        user: { id: userReviewer1.id },
        store: { id: storeData[0].id },
        rating: 5,
        comment: 'Excellent product! Highly recommend.',
      },
      {
        product: { id: productToReview1.id },
        user: { id: userReviewer2.id },
        store: { id: storeData[0].id },
        rating: 4,
        comment: 'Very good, but shipping was a bit slow.',
      },
      {
        product: { id: productToReview2.id },
        user: { id: userReviewer1.id },
        store: { id: storeData[1].id },
        rating: 5,
        comment: 'Fantastic quality and fit!',
      },
    ]);
    await reviewRepository.save(reviewEntities);
    const reviewCount = await reviewRepository.count();
    logger.log(`Total reviews in DB after seeding: ${reviewCount}`);

    // --- Seed Green Jewelry Specific Data ---
    logger.log(
      'Seeding Green Jewelry specific orders, wishlists, and reviews...',
    );

    // Helper to find user from the already seeded userData array
    const findSeededUser = (id: string) => userData.find((u) => u.id === id);
    // Helper to find address from the already seeded addressEntities array
    const findSeededAddress = (id: string): AddressEntity | undefined =>
      addressEntities.find((a) => a.id === id);

    // --- Seed Green Jewelry Orders ---
    const gjUserForOrder1 = findSeededUser(gjUserData[0].id); // Corresponds to GJ_USER_ID_1

    let gjAddressForOrder1: AddressEntity | undefined;
    const gjAddressIdForOrder1Raw =
      gjAddressData.length > 0 ? gjAddressData[0].id : undefined;
    if (gjAddressIdForOrder1Raw) {
      gjAddressForOrder1 = findSeededAddress(gjAddressIdForOrder1Raw);
    }

    const gjProductForOrder1Sku = 'GJ-RNG-001';
    const gjProductForOrder2Sku = 'GJ-EAR-001';

    const gjDbProductForOrder1 = await productRepository.findOneBy({
      sku: gjProductForOrder1Sku,
      storeId: GREEN_JEWELRY_STORE_ID,
    });
    const gjDbProductForOrder2 = await productRepository.findOneBy({
      sku: gjProductForOrder2Sku,
      storeId: GREEN_JEWELRY_STORE_ID,
    });

    if (
      gjUserForOrder1 &&
      gjAddressForOrder1 &&
      gjDbProductForOrder1 &&
      gjDbProductForOrder2
    ) {
      const gjOrderItems: Partial<OrderItemEntity>[] = [
        {
          product: gjDbProductForOrder1, // Pass full entity
          quantity: 1,
          pricePerUnit: gjDbProductForOrder1.price,
          productName: gjDbProductForOrder1.name,
        },
        {
          product: gjDbProductForOrder2, // Pass full entity
          quantity: 1,
          pricePerUnit: gjDbProductForOrder2.price,
          productName: gjDbProductForOrder2.name,
        },
      ];

      const gjSubtotal = gjOrderItems.reduce(
        (sum, item) => sum + (item.pricePerUnit || 0) * (item.quantity || 0),
        0,
      );
      const gjShippingCost = 25.0;
      const gjTaxRate = 0.17;
      const gjTaxAmount = parseFloat((gjSubtotal * gjTaxRate).toFixed(2));
      const gjTotalAmount = parseFloat(
        (gjSubtotal + gjShippingCost + gjTaxAmount).toFixed(2),
      );

      const greenJewelryOrder = orderRepository.create({
        id: 'f1030000-aaaa-1111-1111-000000000001', // Corrected UUID
        orderReference: `GJ-ORD-${Date.now()}-001`,
        user: { id: gjUserForOrder1.id },
        store: { id: GREEN_JEWELRY_STORE_ID },
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        subtotal: gjSubtotal,
        shippingCost: gjShippingCost,
        taxAmount: gjTaxAmount,
        totalAmount: gjTotalAmount,
        shippingAddress: { id: gjAddressForOrder1.id },
        shippingMethod: 'משלוח רגיל',
        trackingNumber: 'GJTRK123456789',
        items: gjOrderItems.map((item) => orderItemRepository.create(item)),
        orderDate: new Date(),
      });
      await orderRepository.save(greenJewelryOrder);
      logger.log(
        `Seeded Green Jewelry order: ${greenJewelryOrder.orderReference}`,
      );
    } else {
      logger.warn(
        'Could not seed Green Jewelry order due to missing user, address, or products.',
      );
      if (!gjUserForOrder1)
        logger.warn(`GJ User for order not found: ${gjUserData[0].id}`);
      if (!gjAddressForOrder1)
        logger.warn(`GJ Address for order not found: ${gjAddressData[0].id}`);
      if (!gjDbProductForOrder1)
        logger.warn(`GJ Product for order not found: ${gjProductForOrder1Sku}`);
      if (!gjDbProductForOrder2)
        logger.warn(`GJ Product for order not found: ${gjProductForOrder2Sku}`);
    }

    // --- Seed Green Jewelry Wishlists ---
    const gjUserForWishlist = findSeededUser(gjUserData[1].id); // Corresponds to GJ_USER_ID_2
    const gjProductForWishlistSku = 'GJ-NCK-001';
    const gjDbProductForWishlist = await productRepository.findOneBy({
      sku: gjProductForWishlistSku,
      storeId: GREEN_JEWELRY_STORE_ID,
    });

    if (gjUserForWishlist && gjDbProductForWishlist) {
      const greenJewelryWishlist = wishlistRepository.create({
        id: 'f1040000-aaaa-1111-1111-000000000001', // Corrected UUID
        user: { id: gjUserForWishlist.id },
        store: { id: GREEN_JEWELRY_STORE_ID },
        items: [
          wishlistItemRepository.create({ product: gjDbProductForWishlist }), // Pass full entity
        ],
      });
      await wishlistRepository.save(greenJewelryWishlist);
      logger.log(
        `Seeded Green Jewelry wishlist for user ${gjUserForWishlist.id}`,
      );
    } else {
      logger.warn(
        'Could not seed Green Jewelry wishlist due to missing user or product.',
      );
      if (!gjUserForWishlist)
        logger.warn(`GJ User for wishlist not found: ${gjUserData[1].id}`);
      if (!gjDbProductForWishlist)
        logger.warn(
          `GJ Product for wishlist not found: ${gjProductForWishlistSku}`,
        );
    }

    // --- Seed Green Jewelry Reviews ---
    const gjUserForReview1 = findSeededUser(gjUserData[0].id); // Yael
    const gjUserForReview2 = findSeededUser(gjUserData[1].id); // Moshe
    const gjProductForReviewSku = 'GJ-RNG-002';
    const gjDbProductForReview = await productRepository.findOneBy({
      sku: gjProductForReviewSku,
      storeId: GREEN_JEWELRY_STORE_ID,
    });

    if (gjDbProductForReview && gjUserForReview1 && gjUserForReview2) {
      const greenJewelryReviews = reviewRepository.create([
        {
          id: 'f1050000-aaaa-1111-1111-000000000001', // Corrected UUID
          product: gjDbProductForReview, // Pass full entity
          user: { id: gjUserForReview1.id },
          store: { id: GREEN_JEWELRY_STORE_ID },
          rating: 5,
          comment: 'טבעת מהממת! בדיוק כמו בתמונה, הגיעה מהר.',
        },
        {
          id: 'f1050000-bbbb-1111-1111-000000000002', // Corrected UUID
          product: gjDbProductForReview, // Pass full entity
          user: { id: gjUserForReview2.id },
          store: { id: GREEN_JEWELRY_STORE_ID },
          rating: 4,
          comment: 'איכות טובה, קצת יקר לטעמי אבל יפה.',
        },
      ]);
      await reviewRepository.save(greenJewelryReviews);
      logger.log(
        `Seeded ${greenJewelryReviews.length} Green Jewelry reviews for product ${gjDbProductForReview.sku}`,
      );
    } else {
      logger.warn(
        'Could not seed Green Jewelry reviews due to missing product or users.',
      );
      if (!gjDbProductForReview)
        logger.warn(
          `GJ Product for review not found: ${gjProductForReviewSku}`,
        );
      if (!gjUserForReview1)
        logger.warn(`GJ User 1 for review not found: ${gjUserData[0].id}`);
      if (!gjUserForReview2)
        logger.warn(`GJ User 2 for review not found: ${gjUserData[1].id}`);
    }
    const finalOrderCount = await orderRepository.count();
    logger.log(`Total orders in DB after all seeding: ${finalOrderCount}`);
    const finalWishlistCount = await wishlistRepository.count();
    logger.log(
      `Total wishlists in DB after all seeding: ${finalWishlistCount}`,
    );
    const finalReviewCount = await reviewRepository.count();
    logger.log(`Total reviews in DB after all seeding: ${finalReviewCount}`);

    // --- Seed A@A.com User Orders for Green Jewelry ---
    logger.log('Seeding A@A.com user orders for Green Jewelry store...');
    const aaUserId = 'c1d2e3f4-a5b6-9999-aaaa-bbbbccccdddd';
    const aaUser = userData.find((u) => u.id === aaUserId);
    const gjStoreEntity = await storeRepository.findOneBy({
      id: GREEN_JEWELRY_STORE_ID,
    });

    if (aaUser && gjStoreEntity) {
      for (const rawOrder of aaUserGreenJewelryOrdersData) {
        const shippingAddress = addressEntities.find(
          (a) => a.id === rawOrder.shippingAddressId,
        );
        if (!shippingAddress) {
          logger.warn(
            `Skipping order ${rawOrder.orderReference} for user ${aaUser.email} due to missing shipping address ID: ${rawOrder.shippingAddressId}`,
          );
          continue;
        }

        const orderItems: OrderItemEntity[] = [];
        let allItemsFound = true;
        for (const item of rawOrder.items) {
          const productEntity = await productRepository.findOneBy({
            sku: item.productId,
            storeId: GREEN_JEWELRY_STORE_ID,
          });
          if (productEntity) {
            orderItems.push(
              orderItemRepository.create({
                product: productEntity, // Link the full ProductEntity
                quantity: item.quantity,
                pricePerUnit: item.pricePerUnit,
                productName: item.productName, // Snapshot
                variantDetails: item.variantDetails, // Snapshot
              }),
            );
          } else {
            logger.warn(
              `Product with SKU ${item.productId} not found for order ${rawOrder.orderReference}. Skipping item.`,
            );
            allItemsFound = false;
            break;
          }
        }

        if (allItemsFound && orderItems.length === rawOrder.items.length) {
          const orderEntity = orderRepository.create({
            id: rawOrder.id,
            orderReference: rawOrder.orderReference,
            user: { id: aaUser.id },
            store: { id: gjStoreEntity.id },
            status: rawOrder.status,
            paymentStatus: rawOrder.paymentStatus,
            subtotal: rawOrder.subtotal,
            shippingCost: rawOrder.shippingCost,
            taxAmount: rawOrder.taxAmount,
            totalAmount: rawOrder.totalAmount,
            shippingAddress: { id: shippingAddress.id }, // Link the full AddressEntity
            shippingMethod: rawOrder.shippingMethod,
            trackingNumber: rawOrder.trackingNumber,
            items: orderItems, // These are already OrderItemEntity instances
            orderDate: rawOrder.orderDate
              ? new Date(rawOrder.orderDate)
              : new Date(),
            notes: [], // Default to empty notes
          });
          await orderRepository.save(orderEntity);
          logger.log(
            `Seeded order ${orderEntity.orderReference} for user ${aaUser.email}`,
          );
        } else {
          logger.warn(
            `Skipping order ${rawOrder.orderReference} for user ${aaUser.email} due to missing product items or mismatch.`,
          );
        }
      }
    } else {
      if (!aaUser)
        logger.warn(
          `User A@A.com (${aaUserId}) not found. Skipping their Green Jewelry orders.`,
        );
      if (!gjStoreEntity)
        logger.warn(
          `Green Jewelry store (${GREEN_JEWELRY_STORE_ID}) not found. Skipping A@A.com orders.`,
        );
    }
    const finalOrderCountAfterAaUser = await orderRepository.count();
    logger.log(
      `Total orders in DB after A@A.com user orders: ${finalOrderCountAfterAaUser}`,
    );

    // --- Seed Luxury Jewelry Specific Data ---
    logger.log(
      'Seeding Luxury Jewelry specific orders, wishlists, and reviews...',
    );

    // --- Seed Luxury Jewelry Orders ---
    const ljUserForOrder1 = findSeededUser(ljUserData[0].id); // Corresponds to LJ_USER_ID_1
    const ljUserForOrder2 = findSeededUser(ljUserData[1].id); // Corresponds to LJ_USER_ID_2

    let ljAddressForOrder1: AddressEntity | undefined;
    let ljAddressForOrder2: AddressEntity | undefined;
    const ljAddressIdForOrder1Raw = ljAddressData.length > 0 ? ljAddressData[0].id : undefined;
    const ljAddressIdForOrder2Raw = ljAddressData.length > 1 ? ljAddressData[1].id : undefined;
    if (ljAddressIdForOrder1Raw) {
      ljAddressForOrder1 = findSeededAddress(ljAddressIdForOrder1Raw);
    }
    if (ljAddressIdForOrder2Raw) {
      ljAddressForOrder2 = findSeededAddress(ljAddressIdForOrder2Raw);
    }

    const ljProductForOrder1Sku = 'LJ-RNG-001';
    const ljProductForOrder2Sku = 'LJ-NECK-001';
    const ljProductForOrder3Sku = 'LJ-BRACE-001';

    const ljDbProductForOrder1 = await productRepository.findOneBy({
      sku: ljProductForOrder1Sku,
      storeId: LUXURY_JEWELRY_STORE_ID,
    });
    const ljDbProductForOrder2 = await productRepository.findOneBy({
      sku: ljProductForOrder2Sku,
      storeId: LUXURY_JEWELRY_STORE_ID,
    });
    const ljDbProductForOrder3 = await productRepository.findOneBy({
      sku: ljProductForOrder3Sku,
      storeId: LUXURY_JEWELRY_STORE_ID,
    });

    // Seed Order 1 for Luxury Jewelry
    if (
      ljUserForOrder1 &&
      ljAddressForOrder1 &&
      ljDbProductForOrder1
    ) {
      const ljOrderItems1: Partial<OrderItemEntity>[] = [
        {
          product: ljDbProductForOrder1,
          quantity: 1,
          pricePerUnit: ljDbProductForOrder1.price,
          productName: ljDbProductForOrder1.name,
        },
      ];

      const ljSubtotal1 = ljOrderItems1.reduce(
        (sum, item) => sum + (item.pricePerUnit || 0) * (item.quantity || 0),
        0,
      );
      const ljShippingCost1 = 15.0;
      const ljTaxRate1 = 0.08;
      const ljTaxAmount1 = parseFloat((ljSubtotal1 * ljTaxRate1).toFixed(2));
      const ljTotalAmount1 = parseFloat(
        (ljSubtotal1 + ljShippingCost1 + ljTaxAmount1).toFixed(2),
      );

      const luxuryJewelryOrder1 = orderRepository.create({
        id: ljOrderData[0].id,
        orderReference: `LJ-ORD-${Date.now()}-001`,
        user: { id: ljUserForOrder1.id },
        store: { id: LUXURY_JEWELRY_STORE_ID },
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        subtotal: ljSubtotal1,
        shippingCost: ljShippingCost1,
        taxAmount: ljTaxAmount1,
        totalAmount: ljTotalAmount1,
        shippingAddress: { id: ljAddressForOrder1.id },
        shippingMethod: 'Express Delivery',
        trackingNumber: 'LJTRK123456789',
        items: ljOrderItems1.map((item) => orderItemRepository.create(item)),
        orderDate: new Date(),
      });
      await orderRepository.save(luxuryJewelryOrder1);
      logger.log(
        `Seeded Luxury Jewelry order 1: ${luxuryJewelryOrder1.orderReference}`,
      );
    }

    // Seed Order 2 for Luxury Jewelry
    if (
      ljUserForOrder2 &&
      ljAddressForOrder2 &&
      ljDbProductForOrder2 &&
      ljDbProductForOrder3
    ) {
      const ljOrderItems2: Partial<OrderItemEntity>[] = [
        {
          product: ljDbProductForOrder2,
          quantity: 2,
          pricePerUnit: ljDbProductForOrder2.price,
          productName: ljDbProductForOrder2.name,
        },
        {
          product: ljDbProductForOrder3,
          quantity: 1,
          pricePerUnit: ljDbProductForOrder3.price,
          productName: ljDbProductForOrder3.name,
        },
      ];

      const ljSubtotal2 = ljOrderItems2.reduce(
        (sum, item) => sum + (item.pricePerUnit || 0) * (item.quantity || 0),
        0,
      );
      const ljShippingCost2 = 25.0;
      const ljTaxRate2 = 0.08;
      const ljTaxAmount2 = parseFloat((ljSubtotal2 * ljTaxRate2).toFixed(2));
      const ljTotalAmount2 = parseFloat(
        (ljSubtotal2 + ljShippingCost2 + ljTaxAmount2).toFixed(2),
      );

      const luxuryJewelryOrder2 = orderRepository.create({
        id: ljOrderData[1].id,
        orderReference: `LJ-ORD-${Date.now()}-002`,
        user: { id: ljUserForOrder2.id },
        store: { id: LUXURY_JEWELRY_STORE_ID },
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PAID,
        subtotal: ljSubtotal2,
        shippingCost: ljShippingCost2,
        taxAmount: ljTaxAmount2,
        totalAmount: ljTotalAmount2,
        shippingAddress: { id: ljAddressForOrder2.id },
        shippingMethod: 'Standard Delivery',
        trackingNumber: 'LJTRK987654321',
        items: ljOrderItems2.map((item) => orderItemRepository.create(item)),
        orderDate: new Date(),
      });
      await orderRepository.save(luxuryJewelryOrder2);
      logger.log(
        `Seeded Luxury Jewelry order 2: ${luxuryJewelryOrder2.orderReference}`,
      );
    }

    // --- Seed Luxury Jewelry Wishlists ---
    const ljUserForWishlist1 = findSeededUser(ljUserData[0].id); // Sophia
    const ljUserForWishlist2 = findSeededUser(ljUserData[1].id); // Alexander
    const ljProductForWishlist1Sku = 'LJ-EARR-001';
    const ljProductForWishlist2Sku = 'LJ-WATCH-001';

    const ljDbProductForWishlist1 = await productRepository.findOneBy({
      sku: ljProductForWishlist1Sku,
      storeId: LUXURY_JEWELRY_STORE_ID,
    });
    const ljDbProductForWishlist2 = await productRepository.findOneBy({
      sku: ljProductForWishlist2Sku,
      storeId: LUXURY_JEWELRY_STORE_ID,
    });

    if (ljUserForWishlist1 && ljDbProductForWishlist1) {
      const luxuryJewelryWishlist1 = wishlistRepository.create({
        id: ljWishlistData[0].id,
        user: { id: ljUserForWishlist1.id },
        store: { id: LUXURY_JEWELRY_STORE_ID },
        items: [
          wishlistItemRepository.create({ product: ljDbProductForWishlist1 }),
        ],
      });
      await wishlistRepository.save(luxuryJewelryWishlist1);
      logger.log(
        `Seeded Luxury Jewelry wishlist 1 for user ${ljUserForWishlist1.id}`,
      );
    }

    if (ljUserForWishlist2 && ljDbProductForWishlist2) {
      const luxuryJewelryWishlist2 = wishlistRepository.create({
        id: ljWishlistData[1].id,
        user: { id: ljUserForWishlist2.id },
        store: { id: LUXURY_JEWELRY_STORE_ID },
        items: [
          wishlistItemRepository.create({ product: ljDbProductForWishlist2 }),
        ],
      });
      await wishlistRepository.save(luxuryJewelryWishlist2);
      logger.log(
        `Seeded Luxury Jewelry wishlist 2 for user ${ljUserForWishlist2.id}`,
      );
    }

    // --- Seed Luxury Jewelry Reviews ---
    const ljUserForReview1 = findSeededUser(ljUserData[0].id); // Sophia
    const ljUserForReview2 = findSeededUser(ljUserData[1].id); // Alexander
    const ljProductForReview1Sku = 'LJ-RNG-002';
    const ljProductForReview2Sku = 'LJ-NECK-002';

    const ljDbProductForReview1 = await productRepository.findOneBy({
      sku: ljProductForReview1Sku,
      storeId: LUXURY_JEWELRY_STORE_ID,
    });
    const ljDbProductForReview2 = await productRepository.findOneBy({
      sku: ljProductForReview2Sku,
      storeId: LUXURY_JEWELRY_STORE_ID,
    });

    if (ljDbProductForReview1 && ljUserForReview1 && ljUserForReview2) {
      const luxuryJewelryReviews1 = reviewRepository.create([
        {
          id: ljReviewData[0].id,
          product: ljDbProductForReview1,
          user: { id: ljUserForReview1.id },
          store: { id: LUXURY_JEWELRY_STORE_ID },
          rating: 5,
          comment: 'Absolutely stunning! The craftsmanship is exceptional.',
        },
        {
          id: ljReviewData[1].id,
          product: ljDbProductForReview1,
          user: { id: ljUserForReview2.id },
          store: { id: LUXURY_JEWELRY_STORE_ID },
          rating: 4,
          comment: 'Beautiful piece, worth every penny.',
        },
      ]);
      await reviewRepository.save(luxuryJewelryReviews1);
      logger.log(
        `Seeded ${luxuryJewelryReviews1.length} Luxury Jewelry reviews for product ${ljDbProductForReview1.sku}`,
      );
    }

    if (ljDbProductForReview2 && ljUserForReview1 && ljUserForReview2) {
      const luxuryJewelryReviews2 = reviewRepository.create([
        {
          id: ljReviewData[2].id,
          product: ljDbProductForReview2,
          user: { id: ljUserForReview1.id },
          store: { id: LUXURY_JEWELRY_STORE_ID },
          rating: 5,
          comment: 'Elegant and timeless design. Perfect for special occasions.',
        },
      ]);
      await reviewRepository.save(luxuryJewelryReviews2);
      logger.log(
        `Seeded ${luxuryJewelryReviews2.length} Luxury Jewelry reviews for product ${ljDbProductForReview2.sku}`,
      );
    }

    const finalOrderCountAfterLuxury = await orderRepository.count();
    logger.log(
      `Total orders in DB after Luxury Jewelry seeding: ${finalOrderCountAfterLuxury}`,
    );
    const finalWishlistCountAfterLuxury = await wishlistRepository.count();
    logger.log(
      `Total wishlists in DB after Luxury Jewelry seeding: ${finalWishlistCountAfterLuxury}`,
    );
    const finalReviewCountAfterLuxury = await reviewRepository.count();
    logger.log(
      `Total reviews in DB after Luxury Jewelry seeding: ${finalReviewCountAfterLuxury}`,
    );

    // --- Seed Promo Codes ---
    logger.log('Seeding promo codes...');
    const promoCodeEntities = promoCodeRepository.create(promoCodeData);
    await promoCodeRepository.save(promoCodeEntities);
    const promoCodeCount = await promoCodeRepository.count();
    logger.log(`Total promo codes in DB after seeding: ${promoCodeCount}`);

    // --- Seed Shipping Methods ---
    logger.log('Seeding shipping methods...');
    const shippingMethodEntities = shippingMethodData.map((sm) => {
      const entity = shippingMethodRepository.create(sm);
      // Ensure store is correctly linked if storeId is used directly in raw data
      // If your RawShippingMethodData directly has storeId, TypeORM should handle it.
      // If it had a 'store' object, you'd map it like: entity.store = await storeRepository.findOneBy({ id: sm.storeId });
      // For simplicity, assuming storeId is sufficient for create.
      return entity;
    });
    await shippingMethodRepository.save(shippingMethodEntities);
    const shippingMethodCount = await shippingMethodRepository.count();
    logger.log(
      `Total shipping methods in DB after seeding: ${shippingMethodCount}`,
    );

    logger.log('Database seeding completed successfully.');
  } catch (error) {
    logger.error('Error during database seeding:', error);
  } finally {
    // Close the application context
    await appContext.close();
    logger.log('Application context closed.');
  }
}

bootstrap();
