import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoryEntity } from './categories/entities/category.entity';
import { ProductEntity } from './products/entities/product.entity';
import { StoreEntity } from './stores/entities/store.entity';
import { CarouselItem } from './carousel/entities/carousel.entity';
import { UserEntity } from './users/entities/user.entity';
import { AddressEntity } from './addresses/entities/address.entity';
import { OrderEntity, OrderStatus, PaymentStatus } from './orders/entities/order.entity';
import { OrderItemEntity } from './orders/entities/order-item.entity';
import { WishlistEntity } from './wishlist/entities/wishlist.entity';
import { WishlistItemEntity } from './wishlist/entities/wishlist-item.entity';
import { ProductVariantEntity } from './products/entities/product-variant.entity';
import { ReviewEntity } from './reviews/entities/review.entity';
import { FaqEntity } from './contact/entities/faq.entity';
import { AboutContentEntity } from './stores/entities/about-content.entity';
import { TestimonialEntity } from './stores/entities/testimonial.entity';
import { PromoCodeEntity } from './promo-codes/entities/promo-code.entity'; // Added PromoCodeEntity
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// --- Define Seed Data ---

const storeData = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Awesome Gadgets & Goods', slug: 'awesome-gadgets' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Fashion & Fun Zone', slug: 'fashion-fun' },
];

// Assign categories to stores
const categoryData = [
  // Store 1: Awesome Gadgets & Goods
  { id: 'aaa00001-c246-4913-9166-f75a99ee0c21', name: 'Electronics', description: 'Gadgets and devices', imageUrl: 'https://picsum.photos/seed/aaa00001/300/200', storeId: storeData[0].id },
  { id: 'aaa00003-c246-4913-9166-f75a99ee0c21', name: 'Home Goods', description: 'Items for your home', imageUrl: 'https://picsum.photos/seed/aaa00003/300/200', storeId: storeData[0].id },
  { id: 'aaa00004-c246-4913-9166-f75a99ee0c21', name: 'Books', description: 'Literature and reading materials', imageUrl: 'https://picsum.photos/seed/aaa00004/300/200', storeId: storeData[0].id },
  { id: 'aaa00007-c246-4913-9166-f75a99ee0c21', name: 'Category_4', description: 'A new category', imageUrl: 'https://picsum.photos/seed/aaa00007/300/200', storeId: storeData[0].id },
  // Store 2: Fashion & Fun Zone
  { id: 'aaa00002-c246-4913-9166-f75a99ee0c21', name: 'Apparel', description: 'Clothing and fashion', imageUrl: 'https://picsum.photos/seed/aaa00002/300/200', storeId: storeData[1].id },
  { id: 'aaa00005-c246-4913-9166-f75a99ee0c21', name: 'Sports & Outdoors', description: 'Equipment for sports and outdoor activities.', imageUrl: 'https://picsum.photos/seed/aaa00005/300/200', storeId: storeData[1].id },
  { id: 'aaa00006-c246-4913-9166-f75a99ee0c21', name: 'Toys & Games', description: 'Fun for all ages.', imageUrl: 'https://picsum.photos/seed/aaa00006/300/200', storeId: storeData[1].id },
];

// Assign products to stores based on their category
const productData = [
  // Electronics (Store 1)
  { sku: 'ELEC-001', name: 'Wireless Noise-Cancelling Headphones', description: 'Experience immersive sound with these premium headphones.', price: 199.99, imageUrls: ['https://picsum.photos/seed/ELEC-001a/500/500', 'https://picsum.photos/seed/ELEC-001b/500/500', 'https://picsum.photos/seed/ELEC-001c/500/500'], tags: ['New', 'Featured', 'Audio'], stockLevel: 50, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[0].id] },
  { sku: 'ELEC-002', name: 'Smartwatch Series 8', description: 'Stay connected and track your fitness goals effortlessly.', price: 349.00, imageUrls: ['https://picsum.photos/seed/ELEC-002a/500/500', 'https://picsum.photos/seed/ELEC-002b/500/500'], tags: ['New', 'Featured', 'Wearable'], stockLevel: 25, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[0].id] },
  { sku: 'ELEC-003', name: 'Portable Bluetooth Speaker', description: 'Compact speaker with powerful sound quality for music on the go.', price: 49.99, imageUrls: ['https://picsum.photos/seed/ELEC-003a/500/500'], tags: ['Sale', 'Featured', 'Audio'], stockLevel: 40, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[0].id] },
  { sku: 'ELEC-004', name: '4K Ultra HD Smart TV', description: 'Stunning picture quality with smart features.', price: 799.99, imageUrls: ['https://picsum.photos/seed/ELEC-004a/500/500', 'https://picsum.photos/seed/ELEC-004b/500/500', 'https://picsum.photos/seed/ELEC-004c/500/500', 'https://picsum.photos/seed/ELEC-004d/500/500'], tags: ['Featured', 'Home Entertainment'], stockLevel: 15, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[0].id] },
  { sku: 'ELEC-005', name: 'Gaming Laptop', description: 'High-performance laptop for gaming enthusiasts.', price: 1299.00, imageUrls: ['https://picsum.photos/seed/ELEC-005a/500/500'], tags: ['New', 'Gaming'], stockLevel: 10, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[0].id] },

  // Apparel (Store 2)
  { sku: 'APPA-001', name: 'Classic Cotton T-Shirt', description: 'A comfortable and stylish everyday essential, available in multiple colors.', price: 24.99, imageUrls: ['https://picsum.photos/seed/APPA-001a/500/500', 'https://picsum.photos/seed/APPA-001b/500/500', 'https://picsum.photos/seed/APPA-001c/500/500'], tags: ['Best Seller', 'Featured', 'Basics'], stockLevel: 0, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[4].id],
    options: ['Size', 'Color'], // Define available options at the product level
    variants: [
      { sku: 'APPA-001-S-Red', options: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Red' }], price: 24.99, stockLevel: 10, imageUrl: 'https://picsum.photos/seed/APPA-001-S-Red/500/500' },
      { sku: 'APPA-001-M-Red', options: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Red' }], price: 24.99, stockLevel: 15 },
      { sku: 'APPA-001-L-Red', options: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Red' }], price: 24.99, stockLevel: 12 },
      { sku: 'APPA-001-XL-Red', options: [{ name: 'Size', value: 'XL' }, { name: 'Color', value: 'Red' }], price: 24.99, stockLevel: 8 },
      { sku: 'APPA-001-S-Blue', options: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Blue' }], price: 24.99, stockLevel: 20, imageUrl: 'https://picsum.photos/seed/APPA-001-S-Blue/500/500' },
      { sku: 'APPA-001-M-Blue', options: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Blue' }], price: 24.99, stockLevel: 18 },
      { sku: 'APPA-001-L-Blue', options: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Blue' }], price: 24.99, stockLevel: 15 },
      { sku: 'APPA-001-XL-Blue', options: [{ name: 'Size', value: 'XL' }, { name: 'Color', value: 'Blue' }], price: 24.99, stockLevel: 10 },
      { sku: 'APPA-001-S-Green', options: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Green' }], price: 24.99, stockLevel: 5, imageUrl: 'https://picsum.photos/seed/APPA-001-S-Green/500/500' },
      { sku: 'APPA-001-M-Green', options: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Green' }], price: 24.99, stockLevel: 7 },
      { sku: 'APPA-001-L-Green', options: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Green' }], price: 24.99, stockLevel: 6 },
      { sku: 'APPA-001-XL-Green', options: [{ name: 'Size', value: 'XL' }, { name: 'Color', value: 'Green' }], price: 24.99, stockLevel: 4 },
    ]
  },
  { sku: 'APPA-002', name: 'Slim Fit Denim Jeans', description: 'Classic slim fit denim jeans for a modern look.', price: 59.99, imageUrls: ['https://picsum.photos/seed/APPA-002a/500/500', 'https://picsum.photos/seed/APPA-002b/500/500'], tags: ['Menswear'], stockLevel: 0, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[4].id],
    options: ['Waist', 'Inseam'],
    variants: [
      { sku: 'APPA-002-30-30', options: [{ name: 'Waist', value: '30' }, { name: 'Inseam', value: '30' }], price: 59.99, stockLevel: 10 },
      { sku: 'APPA-002-30-32', options: [{ name: 'Waist', value: '30' }, { name: 'Inseam', value: '32' }], price: 59.99, stockLevel: 8 },
      { sku: 'APPA-002-32-30', options: [{ name: 'Waist', value: '32' }, { name: 'Inseam', value: '30' }], price: 59.99, stockLevel: 15 },
      { sku: 'APPA-002-32-32', options: [{ name: 'Waist', value: '32' }, { name: 'Inseam', value: '32' }], price: 59.99, stockLevel: 12 },
      { sku: 'APPA-002-34-32', options: [{ name: 'Waist', value: '34' }, { name: 'Inseam', value: '32' }], price: 59.99, stockLevel: 20 },
      { sku: 'APPA-002-34-34', options: [{ name: 'Waist', value: '34' }, { name: 'Inseam', value: '34' }], price: 59.99, stockLevel: 18 },
      { sku: 'APPA-002-36-32', options: [{ name: 'Waist', value: '36' }, { name: 'Inseam', value: '32' }], price: 59.99, stockLevel: 5 },
      { sku: 'APPA-002-36-34', options: [{ name: 'Waist', value: '36' }, { name: 'Inseam', value: '34' }], price: 59.99, stockLevel: 7 },
    ]
  },
  { sku: 'APPA-003', name: 'Lightweight Hoodie', description: 'Perfect for layering or cool evenings.', price: 45.00, imageUrls: ['https://picsum.photos/seed/APPA-003a/500/500'], tags: ['New', 'Casual'], stockLevel: 0, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[4].id],
    options: ['Size', 'Color'],
    variants: [
      { sku: 'APPA-003-S-Grey', options: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Grey' }], price: 45.00, stockLevel: 10 },
      { sku: 'APPA-003-M-Grey', options: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Grey' }], price: 45.00, stockLevel: 15 },
      { sku: 'APPA-003-L-Grey', options: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Grey' }], price: 45.00, stockLevel: 12 },
      { sku: 'APPA-003-S-Black', options: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Black' }], price: 45.00, stockLevel: 20 },
      { sku: 'APPA-003-M-Black', options: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Black' }], price: 45.00, stockLevel: 18 },
      { sku: 'APPA-003-L-Black', options: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Black' }], price: 45.00, stockLevel: 15 },
    ]
  },
  { sku: 'APPA-004', name: 'Summer Dress', description: 'Flowy and comfortable dress for warm weather.', price: 65.00, imageUrls: ['https://picsum.photos/seed/APPA-004a/500/500', 'https://picsum.photos/seed/APPA-004b/500/500'], tags: ['Womenswear', 'Sale'], stockLevel: 0, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[4].id],
    options: ['Size', 'Color'],
    variants: [
      { sku: 'APPA-004-XS-Floral', options: [{ name: 'Size', value: 'XS' }, { name: 'Color', value: 'Floral' }], price: 65.00, stockLevel: 10 },
      { sku: 'APPA-004-S-Floral', options: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Floral' }], price: 65.00, stockLevel: 15 },
      { sku: 'APPA-004-M-Floral', options: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Floral' }], price: 65.00, stockLevel: 12 },
      { sku: 'APPA-004-L-Floral', options: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Floral' }], price: 65.00, stockLevel: 8 },
      { sku: 'APPA-004-S-Yellow', options: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Yellow' }], price: 65.00, stockLevel: 20 },
      { sku: 'APPA-004-M-Yellow', options: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Yellow' }], price: 65.00, stockLevel: 18 },
      { sku: 'APPA-004-L-Yellow', options: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Yellow' }], price: 65.00, stockLevel: 15 },
    ]
  },
  { sku: 'APPA-005', name: 'Running Sneakers', description: 'Lightweight and supportive sneakers for your runs.', price: 89.99, imageUrls: ['https://picsum.photos/seed/APPA-005a/500/500', 'https://picsum.photos/seed/APPA-005b/500/500', 'https://picsum.photos/seed/APPA-005c/500/500'], tags: ['Footwear', 'Sports'], stockLevel: 0, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[4].id, categoryData[5].id], // Assign to both Apparel and Sports
    options: ['Size (US)', 'Color'],
    variants: [
      { sku: 'APPA-005-8-Blue', options: [{ name: 'Size (US)', value: '8' }, { name: 'Color', value: 'Blue' }], price: 89.99, stockLevel: 10 },
      { sku: 'APPA-005-9-Blue', options: [{ name: 'Size (US)', value: '9' }, { name: 'Color', value: 'Blue' }], price: 89.99, stockLevel: 15 },
      { sku: 'APPA-005-10-Blue', options: [{ name: 'Size (US)', value: '10' }, { name: 'Color', value: 'Blue' }], price: 89.99, stockLevel: 12 },
      { sku: 'APPA-005-11-Blue', options: [{ name: 'Size (US)', value: '11' }, { name: 'Color', value: 'Blue' }], price: 89.99, stockLevel: 8 },
      { sku: 'APPA-005-8-Black', options: [{ name: 'Size (US)', value: '8' }, { name: 'Color', value: 'Black' }], price: 89.99, stockLevel: 20 },
      { sku: 'APPA-005-9-Black', options: [{ name: 'Size (US)', value: '9' }, { name: 'Color', value: 'Black' }], price: 89.99, stockLevel: 18 },
      { sku: 'APPA-005-10-Black', options: [{ name: 'Size (US)', value: '10' }, { name: 'Color', value: 'Black' }], price: 89.99, stockLevel: 15 },
      { sku: 'APPA-005-11-Black', options: [{ name: 'Size (US)', value: '11' }, { name: 'Color', value: 'Black' }], price: 89.99, stockLevel: 10 },
    ]
  },

  // Home Goods (Store 1)
  { sku: 'HOME-001', name: 'Ceramic Coffee Mug Set (4)', description: 'Start your day right with this durable set of mugs.', price: 39.99, imageUrls: ['https://picsum.photos/seed/HOME-001a/500/500'], tags: ['Kitchen', 'Gift Idea'], stockLevel: 80, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[1].id] },
  { sku: 'HOME-002', name: 'Luxury Scented Candle', description: 'Relaxing lavender and vanilla scented candle in a glass jar.', price: 22.50, imageUrls: ['https://picsum.photos/seed/HOME-002a/500/500', 'https://picsum.photos/seed/HOME-002b/500/500'], tags: ['New', 'Home Decor'], stockLevel: 70, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[1].id] },
  { sku: 'HOME-003', name: 'Plush Throw Blanket', description: 'Soft and cozy blanket for your sofa or bed.', price: 49.99, imageUrls: ['https://picsum.photos/seed/HOME-003a/500/500'], tags: ['Comfort', 'Home Decor'], stockLevel: 60, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[1].id] },
  { sku: 'HOME-004', name: 'Stainless Steel Cookware Set', description: 'Durable 10-piece cookware set for your kitchen.', price: 149.99, imageUrls: ['https://picsum.photos/seed/HOME-004a/500/500', 'https://picsum.photos/seed/HOME-004b/500/500', 'https://picsum.photos/seed/HOME-004c/500/500'], tags: ['Kitchen', 'Featured'], stockLevel: 20, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[1].id] },
  { sku: 'HOME-005', name: 'Wall Art Print', description: 'Abstract art print to enhance your living space.', price: 75.00, imageUrls: ['https://picsum.photos/seed/HOME-005a/500/500'], tags: ['Home Decor'], stockLevel: 35, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[1].id] },

  // Books (Store 1)
  { sku: 'BOOK-001', name: 'The Midnight Library', description: 'A captivating novel about choices and regrets.', price: 15.99, imageUrls: ['https://picsum.photos/seed/BOOK-001a/500/500'], tags: ['Featured', 'Fiction', 'Best Seller'], stockLevel: 30, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[2].id] },
  { sku: 'BOOK-002', name: 'Astrophysics for People in a Hurry', description: 'A concise and accessible guide to the cosmos.', price: 12.99, imageUrls: ['https://picsum.photos/seed/BOOK-002a/500/500'], tags: ['Non-Fiction', 'Science'], stockLevel: 45, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[2].id] },
  { sku: 'BOOK-003', name: 'Cookbook: Simple Recipes', description: 'Easy and delicious recipes for everyday cooking.', price: 25.00, imageUrls: ['https://picsum.photos/seed/BOOK-003a/500/500'], tags: ['Cooking', 'Gift Idea'], stockLevel: 50, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[2].id] },
  { sku: 'BOOK-004', name: 'Children\'s Picture Book', description: 'A beautifully illustrated story for young readers.', price: 9.99, imageUrls: ['https://picsum.photos/seed/BOOK-004a/500/500'], tags: ['Children', 'Illustrated'], stockLevel: 100, isActive: true, storeId: storeData[0].id, categoryIds: [categoryData[2].id] },

  // Sports & Outdoors (Store 2)
  { sku: 'SPRT-001', name: 'Premium Yoga Mat', description: 'Extra thick, comfortable, and non-slip yoga mat.', price: 34.99, imageUrls: ['https://picsum.photos/seed/SPRT-001a/500/500', 'https://picsum.photos/seed/SPRT-001b/500/500'], tags: ['Best Seller', 'Featured', 'Fitness'], stockLevel: 90, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[5].id] },
  { sku: 'SPRT-002', name: 'Hiking Backpack (40L)', description: 'Durable and spacious backpack for day hikes or travel.', price: 79.99, imageUrls: ['https://picsum.photos/seed/SPRT-002a/500/500', 'https://picsum.photos/seed/SPRT-002b/500/500', 'https://picsum.photos/seed/SPRT-002c/500/500'], tags: ['Hiking', 'Travel', 'New'], stockLevel: 40, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[5].id] },
  { sku: 'SPRT-003', name: 'Resistance Band Set', description: 'Versatile resistance bands for home workouts.', price: 19.99, imageUrls: ['https://picsum.photos/seed/SPRT-003a/500/500'], tags: ['Fitness', 'Workout'], stockLevel: 110, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[5].id] },
  { sku: 'SPRT-004', name: 'Insulated Water Bottle', description: 'Keeps drinks cold for 24 hours or hot for 12.', price: 24.99, imageUrls: ['https://picsum.photos/seed/SPRT-004a/500/500', 'https://picsum.photos/seed/SPRT-004b/500/500'], tags: ['Hydration', 'Outdoor'], stockLevel: 150, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[5].id] },

  // Toys & Games (Store 2)
  { sku: 'TOY-001', name: 'Wooden Building Blocks Set (100pcs)', description: 'Classic wooden building blocks for creative and educational play.', price: 45.99, imageUrls: ['https://picsum.photos/seed/TOY-001a/500/500'], tags: ['Educational', 'Kids'], stockLevel: 150, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[6].id] },
  { sku: 'TOY-002', name: 'Strategy Board Game', description: 'Engaging board game for family game night.', price: 39.99, imageUrls: ['https://picsum.photos/seed/TOY-002a/500/500', 'https://picsum.photos/seed/TOY-002b/500/500'], tags: ['Family Fun', 'Strategy'], stockLevel: 60, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[6].id] },
  { sku: 'TOY-003', name: 'Plush Teddy Bear', description: 'Soft and cuddly teddy bear companion.', price: 19.99, imageUrls: ['https://picsum.photos/seed/TOY-003a/500/500'], tags: ['Gift Idea', 'Kids'], stockLevel: 95, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[6].id] },
  { sku: 'TOY-004', name: 'Remote Control Car', description: 'Fast and fun remote control car for indoor/outdoor play.', price: 29.99, imageUrls: ['https://picsum.photos/seed/TOY-004a/500/500', 'https://picsum.photos/seed/TOY-004b/500/500'], tags: ['Outdoor', 'Kids', 'Sale'], stockLevel: 70, isActive: true, storeId: storeData[1].id, categoryIds: [categoryData[6].id] },
];

// Define which product SKUs are used in the carousel for easier lookup
const carouselProductSkus = ['ELEC-001', 'HOME-001', 'BOOK-001', 'APPA-001', 'SPRT-001'];

// Placeholder for carousel data - will be populated after fetching product IDs
let carouselData: Omit<CarouselItem, 'id' | 'store'>[] = [];

// --- User Data (will be populated inside bootstrap) ---
let userData: any[] = []; // Will hold final user data with hash
const saltRounds = 10;
const userPassword = 'password123'; // Simple password for seeding

// Define user structure without hash initially
const baseUserData = [
  { id: 'a1b2c3d4-e5f6-7777-8888-9999aaaaabbb', email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe', roles: ['customer'] as ('customer' | 'manager' | 'admin')[] }, // Use valid UUID
  { id: 'b1c2d3e4-f5a6-8888-9999-aaaaabbbbccc', email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith', roles: ['customer'] as ('customer' | 'manager' | 'admin')[] }, // Use valid UUID
  { id: 'c1d2e3f4-a5b6-9999-aaaa-bbbbccccdddd', email: 'A@A.com', firstName: 'Admin', lastName: 'User', roles: ['manager', 'customer'] as ('customer' | 'manager' | 'admin')[] }, // Manager User
];


// --- Address Data ---
const addressData = [
  // John Doe Addresses
  { userId: baseUserData[0].id, fullName: 'John Doe', street1: '123 Main St', city: 'Anytown', postalCode: '90210', country: 'USA', isDefaultShipping: true, isDefaultBilling: true },
  { userId: baseUserData[0].id, fullName: 'John Doe Work', street1: '456 Business Ave', street2: 'Suite 100', city: 'Workville', postalCode: '90211', country: 'USA' },
  // Jane Smith Address
  { userId: baseUserData[1].id, fullName: 'Jane Smith', street1: '789 Lake Rd', city: 'Laketown', postalCode: '10001', country: 'USA', isDefaultShipping: true, isDefaultBilling: true },
];

// --- Order Data (Placeholder - needs product IDs) ---
let orderData: any[] = []; // Will populate after fetching products
let orderItemData: any[] = []; // Will populate after fetching products

// --- Wishlist Data (Placeholder - needs product IDs) ---
let wishlistData: any[] = []; // Will populate after fetching products
let wishlistItemData: any[] = []; // Will populate after fetching products

// --- About Content Data ---
// --- About Content Data ---
const aboutContentData = [
  { storeId: storeData[0].id, title: 'About Awesome Gadgets & Goods', content: 'We are passionate about bringing you the latest and greatest gadgets and unique home goods.', imageUrl: 'https://picsum.photos/seed/about-awesome/800/400' },
  { storeId: storeData[1].id, title: 'About Fashion & Fun Zone', content: 'Discover the latest fashion trends and fun items for the whole family.', imageUrl: 'https://picsum.photos/seed/about-fashion/800/400' },
];

// --- Testimonial Data ---
const testimonialData = [
  { storeId: storeData[0].id, author: 'Alice W.', quote: 'Amazing selection of gadgets! Found exactly what I was looking for.', date: new Date('2024-05-01'), rating: 5 },
  { storeId: storeData[0].id, author: 'Bob F.', quote: 'Fast shipping and great customer service. Highly recommend!', date: new Date('2024-04-15'), rating: 4 },
  { storeId: storeData[1].id, author: 'Charlie M.', quote: 'Love the trendy clothes and fun toys for my kids.', date: new Date('2024-05-10'), rating: 5 },
];
// --- FAQ Data ---
const faqData = [
  { storeId: storeData[0].id, question: 'What is your return policy?', answer: 'We offer a 30-day return policy on most items.' },
  { storeId: storeData[0].id, question: 'How long does shipping take?', answer: 'Standard shipping usually takes 3-5 business days.' },
  { storeId: storeData[1].id, question: 'Do you offer international shipping?', answer: 'Yes, we ship to select international destinations.' },
];

// --- Review Data (Placeholder - needs product and user IDs) ---
let reviewData: any[] = []; // Will populate after fetching products and users

// --- Promo Code Data ---
const promoCodeData: Partial<PromoCodeEntity>[] = [
  { code: 'SUMMER20', discountType: 'percentage', discountValue: 20, isActive: true, validTo: new Date('2025-08-31') },
  { code: 'SAVE10', discountType: 'fixed', discountValue: 10, isActive: true, minCartValue: 50 },
  { code: 'STORE1SPECIFIC', discountType: 'percentage', discountValue: 15, isActive: true, storeId: storeData[0].id },
  { code: 'EXPIREDCODE', discountType: 'fixed', discountValue: 5, isActive: false, validTo: new Date('2024-01-01') },
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
  const productVariantRepository = dataSource.getRepository(ProductVariantEntity);
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


  try {
    // --- Clear existing data (order matters due to foreign keys) ---
    logger.log('Clearing existing data...');
    await reviewRepository.delete({});
    await orderItemRepository.delete({});
    await orderRepository.delete({});
    await wishlistItemRepository.delete({});
    await wishlistRepository.delete({});
    await addressRepository.delete({});
    await promoCodeRepository.delete({});
    await productVariantRepository.delete({});
    await productRepository.delete({});
    await categoryRepository.delete({});
    await carouselRepository.delete({});
    await faqRepository.delete({});
    await aboutContentRepository.delete({});
    await testimonialRepository.delete({});
    await storeRepository.delete({});
    await userRepository.delete({});
    logger.log('Existing data cleared.');

    // --- Seed Stores ---
    logger.log('Seeding stores...');
    const storeUpsertResult = await storeRepository.upsert(storeData, ['id']);
    logger.log(`Stores seeded/updated: ${storeUpsertResult.raw?.length || storeUpsertResult.generatedMaps?.length || 'N/A (check upsert result)'}`);
    const storeCount = await storeRepository.count();
    logger.log(`Total stores in DB after seeding: ${storeCount}`);

    // --- Seed Categories ---
    logger.log('Seeding categories...');
    const categoryUpsertResult = await categoryRepository.upsert(categoryData, ['id']);
    logger.log(`Categories seeded/updated: ${categoryUpsertResult.raw?.length || categoryUpsertResult.generatedMaps?.length || 'N/A (check upsert result)'}`);
    const categoryCount = await categoryRepository.count();
    logger.log(`Total categories in DB after seeding: ${categoryCount}`);


    // --- Seed Products and Variants ---
    logger.log('Seeding products and variants...');
    const productsToSave: ProductEntity[] = [];
    for (const product of productData) {
      const { categoryIds, variants: variantData, ...productDetails } = product as any;
      const productEntityInstance = productRepository.create(productDetails as Partial<ProductEntity>);

      if (categoryIds && categoryIds.length > 0) {
        const categories = await categoryRepository.findBy({ id: In(categoryIds) });
        productEntityInstance.categories = categories;
      }

      if (variantData && variantData.length > 0) {
        productEntityInstance.variants = variantData.map(variant => productVariantRepository.create(variant as Partial<ProductVariantEntity>));
      }
      productsToSave.push(productEntityInstance);
    }

    await productRepository.save(productsToSave);
    const productCount = await productRepository.count();
    const variantCount = await productVariantRepository.count();
    logger.log(`Total products in DB after seeding: ${productCount}`);
    logger.log(`Total variants in DB after seeding: ${variantCount}`);


    // Fetch some products to use in orders/wishlists/reviews (ensure variants are loaded if needed)
    const productsStore1 = await productRepository.find({ where: { storeId: storeData[0].id }, take: 5, relations: ['variants'] }); // Fetch more products for reviews
    const productsStore2 = await productRepository.find({ where: { storeId: storeData[1].id }, take: 5, relations: ['variants'] }); // Fetch more products for reviews
    if (productsStore1.length < 3 || productsStore2.length < 3) { // Adjusted check
        throw new Error('Not enough products found in stores to seed orders/wishlists/reviews.');
    }


    // --- Fetch Product IDs for Carousel Links ---
    logger.log('Fetching product IDs for carousel links...');
    const productsForCarousel = await productRepository.find({
      where: { sku: In(carouselProductSkus) },
      select: ['id', 'sku'], // Select only necessary fields
    });

    const skuToIdMap = new Map<string, string>();
    productsForCarousel.forEach(p => skuToIdMap.set(p.sku, p.id));
    logger.log(`Mapped SKUs to IDs: ${JSON.stringify(Object.fromEntries(skuToIdMap))}`);

    // --- Build Carousel Data with Correct Product IDs ---
    carouselData = [
      // Store 1: Awesome Gadgets & Goods
      { imageUrl: 'https://picsum.photos/seed/carousel1-store1/1920/400', altText: 'Promotion: Wireless Headphones', linkUrl: skuToIdMap.get('ELEC-001'), storeId: storeData[0].id },
      { imageUrl: 'https://picsum.photos/seed/carousel2-store1/1920/400', altText: 'Promotion: Coffee Mug Set', linkUrl: skuToIdMap.get('HOME-001'), storeId: storeData[0].id },
      { imageUrl: 'https://picsum.photos/seed/carousel3-store1/1920/400', altText: 'Featured Book: The Midnight Library', linkUrl: skuToIdMap.get('BOOK-001'), storeId: storeData[0].id },
      // Store 2: Fashion & Fun Zone
      { imageUrl: 'https://picsum.photos/seed/carousel1-store2/1920/400', altText: 'Featured: Classic Cotton T-Shirt', linkUrl: skuToIdMap.get('APPA-001'), storeId: storeData[1].id },
      { imageUrl: 'https://picsum.photos/seed/carousel2-store2/1920/400', altText: 'Featured: Premium Yoga Mat', linkUrl: skuToIdMap.get('SPRT-001'), storeId: storeData[1].id },
    ].filter(item => !!item.linkUrl); // Filter out items if product ID wasn't found (optional safety)


    // --- Seed Carousel Items ---
    logger.log('Seeding carousel items...');
    // Clear existing items for the seeded stores first to prevent duplicates on re-run
    await carouselRepository.delete({ storeId: In(storeData.map(s => s.id)) });
    logger.log(`Cleared existing carousel items for seeded stores.`);

    if (carouselData.length > 0) {
        const createdCarouselItems = carouselRepository.create(carouselData);
        await carouselRepository.save(createdCarouselItems);
        logger.log(`Saved ${createdCarouselItems.length} new carousel items.`);
    } else {
        logger.log('No carousel items to save (possibly due to missing product IDs).');
    }
    const carouselCount = await carouselRepository.count();
    logger.log(`Total carousel items in DB after seeding: ${carouselCount}`);

    // --- Generate User Hash and Prepare User Data ---
    logger.log('Preparing user data...');
    const userPasswordHash = await bcrypt.hash(userPassword, saltRounds);
    userData = baseUserData.map(user => ({ ...user, passwordHash: userPasswordHash }));

    // --- Seed Users ---
    logger.log('Seeding users...');
    await userRepository.upsert(userData, ['id']);
    const userCount = await userRepository.count();
    logger.log(`Total users in DB after seeding: ${userCount}`);

    // --- Clear Dependent Data First ---
    logger.log('Clearing existing orders, wishlists, and addresses for seeded users...');
    // Delete orders first, as they depend on addresses
    await orderRepository.delete({ user: { id: In(userData.map(u => u.id)) } });
    // Delete wishlists
    await wishlistRepository.delete({ user: { id: In(userData.map(u => u.id)) } });
    // Now delete addresses
    await addressRepository.delete({ user: { id: In(userData.map(u => u.id)) } });

    // --- Seed Addresses ---
    logger.log('Seeding addresses...');
    const addressEntities = addressRepository.create(addressData.map(addr => ({ ...addr, user: { id: addr.userId } })));
    await addressRepository.save(addressEntities);
    const addressCount = await addressRepository.count();
    logger.log(`Total addresses in DB after seeding: ${addressCount}`);
    const johnsDefaultAddress = addressEntities.find(a => a.user?.id === userData[0].id && a.isDefaultShipping);

    // --- Seed Orders ---
    logger.log('Seeding orders...');
    // Deletion moved above address seeding

    if (johnsDefaultAddress) {
        const order1Product1 = productsStore1[0];
        const order1Product2 = productsStore1[1];
        const order1Subtotal = (order1Product1.price * 1) + (order1Product2.price * 2);
        const order1Shipping = 5.99;
        const order1Tax = order1Subtotal * 0.08;
        const order1Total = order1Subtotal + order1Shipping + order1Tax;

        const order1 = orderRepository.create({
            orderReference: `ORD-${Date.now()}-001`,
            user: { id: userData[0].id },
            store: { id: storeData[0].id },
            status: OrderStatus.COMPLETED,
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
            ]
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
            ]
        });

        const order3Product1 = productsStore2[0]; // Product from store 2
        const order3Subtotal = order3Product1.price * 3;
        const order3Shipping = 7.50;
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
            shippingAddress: addressEntities.find(a => a.user?.id === userData[1].id),
            shippingMethod: 'Express Shipping',
            trackingNumber: 'EXP-123-456',
            items: [
                orderItemRepository.create({
                    product: { id: order3Product1.id },
                    quantity: 3,
                    pricePerUnit: order3Product1.price,
                    productName: order3Product1.name,
                }),
            ]
        });

        await orderRepository.save([order1, order2, order3]);
        logger.log(`Created sample orders: ${order1.orderReference}, ${order2.orderReference}, ${order3.orderReference}`);

    } else {
        logger.warn('Skipping order seeding as default address for John Doe was not found.');
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
            wishlistItemRepository.create({ product: { id: wishlist1Product1.id } })
        ]
    });
    await wishlistRepository.save(wishlist1);
    logger.log(`Created sample wishlist for user ${userData[1].id} in store ${storeData[1].id}`);
    const wishlistCount = await wishlistRepository.count();
    logger.log(`Total wishlists in DB after seeding: ${wishlistCount}`);

    // --- Seed About Content ---
    logger.log('Seeding about content...');
    const aboutContentEntities = aboutContentRepository.create(aboutContentData);
    await aboutContentRepository.save(aboutContentEntities);
    const aboutContentCount = await aboutContentRepository.count();
    logger.log(`Total about content entries in DB after seeding: ${aboutContentCount}`);

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

    // --- Seed Promo Codes ---
    logger.log('Seeding promo codes...');
    const promoCodeEntities = promoCodeRepository.create(promoCodeData);
    await promoCodeRepository.save(promoCodeEntities);
    const promoCodeCount = await promoCodeRepository.count();
    logger.log(`Total promo codes in DB after seeding: ${promoCodeCount}`);


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