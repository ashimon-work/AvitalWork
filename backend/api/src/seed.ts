import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoryEntity } from './categories/entities/category.entity';
import { ProductEntity } from './products/entities/product.entity';
import { StoreEntity } from './stores/entities/store.entity';
import { CarouselItem } from './carousel/entities/carousel.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

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
  // Store 2: Fashion & Fun Zone
  { id: 'aaa00002-c246-4913-9166-f75a99ee0c21', name: 'Apparel', description: 'Clothing and fashion', imageUrl: 'https://picsum.photos/seed/aaa00002/300/200', storeId: storeData[1].id },
  { id: 'aaa00005-c246-4913-9166-f75a99ee0c21', name: 'Sports & Outdoors', description: 'Equipment for sports and outdoor activities.', imageUrl: 'https://picsum.photos/seed/aaa00005/300/200', storeId: storeData[1].id },
  { id: 'aaa00006-c246-4913-9166-f75a99ee0c21', name: 'Toys & Games', description: 'Fun for all ages.', imageUrl: 'https://picsum.photos/seed/aaa00006/300/200', storeId: storeData[1].id },
];

// Assign products to stores based on their category
const productData = [
  // Electronics (Store 1)
  { sku: 'ELEC-001', name: 'Wireless Noise-Cancelling Headphones', description: 'Experience immersive sound with these premium headphones.', price: 199.99, imageUrl: 'https://picsum.photos/seed/ELEC-001/500/500', tags: ['New', 'Featured', 'Audio'], stockLevel: 50, isActive: true, storeId: storeData[0].id },
  { sku: 'ELEC-002', name: 'Smartwatch Series 8', description: 'Stay connected and track your fitness goals effortlessly.', price: 349.00, imageUrl: 'https://picsum.photos/seed/ELEC-002/500/500', tags: ['New', 'Featured', 'Wearable'], stockLevel: 25, isActive: true, storeId: storeData[0].id },
  { sku: 'ELEC-003', name: 'Portable Bluetooth Speaker', description: 'Compact speaker with powerful sound quality for music on the go.', price: 49.99, imageUrl: 'https://picsum.photos/seed/ELEC-003/500/500', tags: ['Sale', 'Featured', 'Audio'], stockLevel: 40, isActive: true, storeId: storeData[0].id },
  { sku: 'ELEC-004', name: '4K Ultra HD Smart TV', description: 'Stunning picture quality with smart features.', price: 799.99, imageUrl: 'https://picsum.photos/seed/ELEC-004/500/500', tags: ['Featured', 'Home Entertainment'], stockLevel: 15, isActive: true, storeId: storeData[0].id },
  { sku: 'ELEC-005', name: 'Gaming Laptop', description: 'High-performance laptop for gaming enthusiasts.', price: 1299.00, imageUrl: 'https://picsum.photos/seed/ELEC-005/500/500', tags: ['New', 'Gaming'], stockLevel: 10, isActive: true, storeId: storeData[0].id },

  // Apparel (Store 2)
  { sku: 'APPA-001', name: 'Classic Cotton T-Shirt', description: 'A comfortable and stylish everyday essential, available in multiple colors.', price: 24.99, imageUrl: 'https://picsum.photos/seed/APPA-001/500/500', tags: ['Best Seller', 'Featured', 'Basics'], stockLevel: 120, isActive: true, storeId: storeData[1].id },
  { sku: 'APPA-002', name: 'Slim Fit Denim Jeans', description: 'Classic slim fit denim jeans for a modern look.', price: 59.99, imageUrl: 'https://picsum.photos/seed/APPA-002/500/500', tags: ['Menswear'], stockLevel: 65, isActive: true, storeId: storeData[1].id },
  { sku: 'APPA-003', name: 'Lightweight Hoodie', description: 'Perfect for layering or cool evenings.', price: 45.00, imageUrl: 'https://picsum.photos/seed/APPA-003/500/500', tags: ['New', 'Casual'], stockLevel: 75, isActive: true, storeId: storeData[1].id },
  { sku: 'APPA-004', name: 'Summer Dress', description: 'Flowy and comfortable dress for warm weather.', price: 65.00, imageUrl: 'https://picsum.photos/seed/APPA-004/500/500', tags: ['Womenswear', 'Sale'], stockLevel: 40, isActive: true, storeId: storeData[1].id },
  { sku: 'APPA-005', name: 'Running Sneakers', description: 'Lightweight and supportive sneakers for your runs.', price: 89.99, imageUrl: 'https://picsum.photos/seed/APPA-005/500/500', tags: ['Footwear', 'Sports'], stockLevel: 55, isActive: true, storeId: storeData[1].id },

  // Home Goods (Store 1)
  { sku: 'HOME-001', name: 'Ceramic Coffee Mug Set (4)', description: 'Start your day right with this durable set of mugs.', price: 39.99, imageUrl: 'https://picsum.photos/seed/HOME-001/500/500', tags: ['Kitchen', 'Gift Idea'], stockLevel: 80, isActive: true, storeId: storeData[0].id },
  { sku: 'HOME-002', name: 'Luxury Scented Candle', description: 'Relaxing lavender and vanilla scented candle in a glass jar.', price: 22.50, imageUrl: 'https://picsum.photos/seed/HOME-002/500/500', tags: ['New', 'Home Decor'], stockLevel: 70, isActive: true, storeId: storeData[0].id },
  { sku: 'HOME-003', name: 'Plush Throw Blanket', description: 'Soft and cozy blanket for your sofa or bed.', price: 49.99, imageUrl: 'https://picsum.photos/seed/HOME-003/500/500', tags: ['Comfort', 'Home Decor'], stockLevel: 60, isActive: true, storeId: storeData[0].id },
  { sku: 'HOME-004', name: 'Stainless Steel Cookware Set', description: 'Durable 10-piece cookware set for your kitchen.', price: 149.99, imageUrl: 'https://picsum.photos/seed/HOME-004/500/500', tags: ['Kitchen', 'Featured'], stockLevel: 20, isActive: true, storeId: storeData[0].id },
  { sku: 'HOME-005', name: 'Wall Art Print', description: 'Abstract art print to enhance your living space.', price: 75.00, imageUrl: 'https://picsum.photos/seed/HOME-005/500/500', tags: ['Home Decor'], stockLevel: 35, isActive: true, storeId: storeData[0].id },

  // Books (Store 1)
  { sku: 'BOOK-001', name: 'The Midnight Library', description: 'A captivating novel about choices and regrets.', price: 15.99, imageUrl: 'https://picsum.photos/seed/BOOK-001/500/500', tags: ['Featured', 'Fiction', 'Best Seller'], stockLevel: 30, isActive: true, storeId: storeData[0].id },
  { sku: 'BOOK-002', name: 'Astrophysics for People in a Hurry', description: 'A concise and accessible guide to the cosmos.', price: 12.99, imageUrl: 'https://picsum.photos/seed/BOOK-002/500/500', tags: ['Non-Fiction', 'Science'], stockLevel: 45, isActive: true, storeId: storeData[0].id },
  { sku: 'BOOK-003', name: 'Cookbook: Simple Recipes', description: 'Easy and delicious recipes for everyday cooking.', price: 25.00, imageUrl: 'https://picsum.photos/seed/BOOK-003/500/500', tags: ['Cooking', 'Gift Idea'], stockLevel: 50, isActive: true, storeId: storeData[0].id },
  { sku: 'BOOK-004', name: 'Children\'s Picture Book', description: 'A beautifully illustrated story for young readers.', price: 9.99, imageUrl: 'https://picsum.photos/seed/BOOK-004/500/500', tags: ['Children', 'Illustrated'], stockLevel: 100, isActive: true, storeId: storeData[0].id },

  // Sports & Outdoors (Store 2)
  { sku: 'SPRT-001', name: 'Premium Yoga Mat', description: 'Extra thick, comfortable, and non-slip yoga mat.', price: 34.99, imageUrl: 'https://picsum.photos/seed/SPRT-001/500/500', tags: ['Best Seller', 'Featured', 'Fitness'], stockLevel: 90, isActive: true, storeId: storeData[1].id },
  { sku: 'SPRT-002', name: 'Hiking Backpack (40L)', description: 'Durable and spacious backpack for day hikes or travel.', price: 79.99, imageUrl: 'https://picsum.photos/seed/SPRT-002/500/500', tags: ['Hiking', 'Travel', 'New'], stockLevel: 40, isActive: true, storeId: storeData[1].id },
  { sku: 'SPRT-003', name: 'Resistance Band Set', description: 'Versatile resistance bands for home workouts.', price: 19.99, imageUrl: 'https://picsum.photos/seed/SPRT-003/500/500', tags: ['Fitness', 'Workout'], stockLevel: 110, isActive: true, storeId: storeData[1].id },
  { sku: 'SPRT-004', name: 'Insulated Water Bottle', description: 'Keeps drinks cold for 24 hours or hot for 12.', price: 24.99, imageUrl: 'https://picsum.photos/seed/SPRT-004/500/500', tags: ['Hydration', 'Outdoor'], stockLevel: 150, isActive: true, storeId: storeData[1].id },

  // Toys & Games (Store 2)
  { sku: 'TOY-001', name: 'Wooden Building Blocks Set (100pcs)', description: 'Classic wooden building blocks for creative and educational play.', price: 45.99, imageUrl: 'https://picsum.photos/seed/TOY-001/500/500', tags: ['Educational', 'Kids'], stockLevel: 150, isActive: true, storeId: storeData[1].id },
  { sku: 'TOY-002', name: 'Strategy Board Game', description: 'Engaging board game for family game night.', price: 39.99, imageUrl: 'https://picsum.photos/seed/TOY-002/500/500', tags: ['Family Fun', 'Strategy'], stockLevel: 60, isActive: true, storeId: storeData[1].id },
  { sku: 'TOY-003', name: 'Plush Teddy Bear', description: 'Soft and cuddly teddy bear companion.', price: 19.99, imageUrl: 'https://picsum.photos/seed/TOY-003/500/500', tags: ['Gift Idea', 'Kids'], stockLevel: 95, isActive: true, storeId: storeData[1].id },
  { sku: 'TOY-004', name: 'Remote Control Car', description: 'Fast and fun remote control car for indoor/outdoor play.', price: 29.99, imageUrl: 'https://picsum.photos/seed/TOY-004/500/500', tags: ['Outdoor', 'Kids', 'Sale'], stockLevel: 70, isActive: true, storeId: storeData[1].id },
];

// Assign carousel items to stores
const carouselData = [
  // Store 1: Awesome Gadgets & Goods (slug: awesome-gadgets)
  // Link to product ELEC-001 (using SKU as identifier for now, assuming product routes use SKU or ID)
  { imageUrl: 'https://picsum.photos/seed/carousel1-store1/1920/400', altText: 'Promotion: Wireless Headphones', linkUrl: `ELEC-001`, storeId: storeData[0].id }, // Store only SKU
  // Link to product HOME-001
  { imageUrl: 'https://picsum.photos/seed/carousel2-store1/1920/400', altText: 'Promotion: Coffee Mug Set', linkUrl: `HOME-001`, storeId: storeData[0].id }, // Store only SKU
  // Link to product BOOK-001
  { imageUrl: 'https://picsum.photos/seed/carousel3-store1/1920/400', altText: 'Featured Book: The Midnight Library', linkUrl: `BOOK-001`, storeId: storeData[0].id }, // Store only SKU
  // Store 2: Fashion & Fun Zone (slug: fashion-fun)
  // Link to product APPA-001
  { imageUrl: 'https://picsum.photos/seed/carousel1-store2/1920/400', altText: 'Featured: Classic Cotton T-Shirt', linkUrl: `APPA-001`, storeId: storeData[1].id }, // Store only SKU
  // Link to product SPRT-001
  { imageUrl: 'https://picsum.photos/seed/carousel2-store2/1920/400', altText: 'Featured: Premium Yoga Mat', linkUrl: `SPRT-001`, storeId: storeData[1].id }, // Store only SKU
];


async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Starting database seeding process...');

  // Create a standalone application context
  const appContext = await NestFactory.createApplicationContext(AppModule);

  // Get repository instances
  const storeRepository = appContext.get<Repository<StoreEntity>>(getRepositoryToken(StoreEntity));
  const categoryRepository = appContext.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
  const productRepository = appContext.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
  const carouselRepository = appContext.get<Repository<CarouselItem>>(getRepositoryToken(CarouselItem));

  try {
    // --- Seed Stores ---
    logger.log('Seeding stores...');
    const storeUpsertResult = await storeRepository.upsert(storeData, ['id']);
    logger.log(`Stores seeded/updated: ${storeUpsertResult.raw?.length || storeUpsertResult.generatedMaps?.length || 'N/A (check upsert result)'}`);
    const storeCount = await storeRepository.count();
    logger.log(`Total stores in DB after seeding: ${storeCount}`);

    // --- Seed Categories ---
    logger.log('Seeding categories...');
    const categoryUpsertResult = await categoryRepository.upsert(categoryData, ['id']); // Upsert based on ID
    logger.log(`Categories seeded/updated: ${categoryUpsertResult.raw?.length || categoryUpsertResult.generatedMaps?.length || 'N/A (check upsert result)'}`);
    const categoryCount = await categoryRepository.count();
    logger.log(`Total categories in DB after seeding: ${categoryCount}`);


    // --- Seed Products ---
    logger.log('Seeding products...');
    await productRepository.upsert(productData, ['sku']); // Upsert based on SKU
    const productCount = await productRepository.count(); // Count products after upsert
    logger.log(`Total products in DB after seeding: ${productCount}`);

    // --- Seed Carousel Items ---
    logger.log('Seeding carousel items...');
    // Use simple `create` and `save` in a loop or `upsert` if you add a unique constraint later
    // For simplicity with potential re-runs, let's clear existing items for the seeded stores first
    await carouselRepository.delete({ storeId: storeData[0].id });
    await carouselRepository.delete({ storeId: storeData[1].id });
    const createdCarouselItems = carouselRepository.create(carouselData);
    await carouselRepository.save(createdCarouselItems);
    const carouselCount = await carouselRepository.count();
    logger.log(`Total carousel items in DB after seeding: ${carouselCount}`);

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