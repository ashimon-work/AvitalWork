import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoriesService } from './categories/categories.service';
import { ProductsService } from './products/products.service';
import { CategoryEntity } from './categories/entities/category.entity';
import { ProductEntity } from './products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

// --- Define Seed Data ---

// Use the same static IDs as defined (or intended to be defined) in CategoriesService
const categoryData = [
  { id: 'aaa00001-c246-4913-9166-f75a99ee0c21', name: 'Electronics', description: 'Gadgets and devices', imageUrl: 'https://placehold.co/300x200/E8D4B0/704214?text=Electronics' },
  { id: 'aaa00002-c246-4913-9166-f75a99ee0c21', name: 'Apparel', description: 'Clothing and fashion', imageUrl: 'https://placehold.co/300x200/B0E8C8/147042?text=Apparel' },
  { id: 'aaa00003-c246-4913-9166-f75a99ee0c21', name: 'Home Goods', description: 'Items for your home', imageUrl: 'https://placehold.co/300x200/B0C4E8/144270?text=Home+Goods' },
  { id: 'aaa00004-c246-4913-9166-f75a99ee0c21', name: 'Books', description: 'Literature and reading materials', imageUrl: 'https://placehold.co/300x200/E8B0B0/701414?text=Books' },
  { id: 'aaa00005-c246-4913-9166-f75a99ee0c21', name: 'Sports & Outdoors', description: 'Equipment for sports and outdoor activities.', imageUrl: 'https://placehold.co/300x200/D4E8B0/427014?text=Sports' },
  { id: 'aaa00006-c246-4913-9166-f75a99ee0c21', name: 'Toys & Games', description: 'Fun for all ages.', imageUrl: 'https://placehold.co/300x200/E8B0D4/701442?text=Toys' },
];

// Product data referencing category IDs (omit categoryIds as it's not a direct column)
const productData = [
    // Electronics
    { sku: 'ELEC-001', name: 'Wireless Noise-Cancelling Headphones', description: 'Experience immersive sound...', price: 199.99, imageUrl: 'https://placehold.co/500x500/E8D4B0/704214?text=Headphones', tags: ['New', 'Featured'], stockLevel: 50, isActive: true },
    { sku: 'ELEC-002', name: 'Smartwatch Series 8', description: 'Stay connected and track your fitness.', price: 349.0, imageUrl: 'https://placehold.co/500x500/E8D4B0/704214?text=Smartwatch', tags: ['New', 'Featured'], stockLevel: 25, isActive: true },
    { sku: 'ELEC-003', name: 'Bluetooth Speaker', description: 'Portable speaker with great sound quality.', price: 49.99, imageUrl: 'https://placehold.co/500x500/E8D4B0/704214?text=Speaker', tags: ['Sale', 'Featured'], stockLevel: 40, isActive: true }, // Added Featured
    // Apparel
    { sku: 'APPA-001', name: 'Classic Cotton T-Shirt', description: 'A comfortable and stylish everyday essential.', price: 24.99, imageUrl: 'https://placehold.co/500x500/B0E8C8/147042?text=T-Shirt', tags: ['Best Seller', 'Featured'], stockLevel: 120, isActive: true }, // Added Featured
    { sku: 'APPA-002', name: 'Denim Jeans', description: 'Classic fit denim jeans for any occasion.', price: 59.99, imageUrl: 'https://placehold.co/500x500/B0E8C8/147042?text=Jeans', stockLevel: 65, isActive: true },
    // Home Goods
    { sku: 'HOME-001', name: 'Ceramic Coffee Mug', description: 'Start your day right with this durable mug.', price: 12.5, imageUrl: 'https://placehold.co/500x500/B0C4E8/144270?text=Mug', stockLevel: 80, isActive: true },
    { sku: 'HOME-002', name: 'Scented Candle', description: 'Relaxing lavender scented candle.', price: 18.00, imageUrl: 'https://placehold.co/500x500/B0C4E8/144270?text=Candle', tags: ['New'], stockLevel: 70, isActive: true },
    // Books
    { sku: 'BOOK-001', name: 'The Mystery Novel', description: 'A thrilling page-turner...', price: 15.99, imageUrl: 'https://placehold.co/500x500/E8B0B0/701414?text=Book', tags: ['Featured'], stockLevel: 30, isActive: true },
    // Sports
    { sku: 'SPRT-001', name: 'Yoga Mat', description: 'Comfortable and non-slip yoga mat.', price: 29.99, imageUrl: 'https://placehold.co/500x500/D4E8B0/427014?text=Yoga+Mat', tags: ['Best Seller', 'Featured'], stockLevel: 90, isActive: true }, // Added Featured
    // Toys
    { sku: 'TOY-001', name: 'Building Blocks Set', description: 'Classic building blocks for creative play.', price: 39.99, imageUrl: 'https://placehold.co/500x500/E8B0D4/701442?text=Blocks', stockLevel: 150, isActive: true },
];


async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Starting database seeding process...');

  // Create a standalone application context
  const appContext = await NestFactory.createApplicationContext(AppModule);

  // Get repository instances
  const categoryRepository = appContext.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
  const productRepository = appContext.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));

  try {
    // --- Seed Categories ---
    logger.log('Seeding categories...');
    // Use save with overwrite to handle potential re-runs, or check existence first
    // Using insert ignores duplicates based on primary key if DB supports it
    const categoryInsertResult = await categoryRepository.upsert(categoryData, ['id']); // Use upsert if available and desired
    // const categoryInsertResult = await categoryRepository.insert(categoryData); // Or use insert and handle errors
    logger.log(`Categories seeded: ${categoryInsertResult.raw?.length || categoryInsertResult.generatedMaps?.length || 'N/A (check upsert result)'}`);


    // --- Seed Products ---
    // Note: This simple version doesn't link products to categories yet,
    // as the ManyToMany relation isn't defined in the entities.
    // We would need to define the relation and then assign categories when saving products.
    logger.log('Seeding products (without category relations for now)...');
    const productInsertResult = await productRepository.upsert(productData, ['sku']); // Upsert based on SKU to avoid duplicates on re-run
    logger.log(`Products seeded: ${productInsertResult.raw?.length || productInsertResult.generatedMaps?.length || 'N/A (check upsert result)'}`);


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