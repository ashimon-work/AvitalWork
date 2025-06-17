import 'package:flutter/material.dart';
import 'package:global_marketplace_app/models/category.dart';
import 'package:global_marketplace_app/models/product.dart';
import 'package:global_marketplace_app/models/store.dart';
import 'package:global_marketplace_app/widgets/product_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Product> mockProducts = [
      Product(
        id: '1',
        sku: 'SKU001',
        name: 'Classic Leather Jacket',
        description: 'A timeless leather jacket.',
        price: 199.99,
        imageUrls: ['https://picsum.photos/seed/p1/400/400'],
        categories: [
          Category(
              id: 'cat1',
              name: 'Apparel',
              description: '',
              imageUrl: '',
              isFeaturedInMarketplace: true,
              storeId: 'store1',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now())
        ],
        tags: ['leather', 'jacket', 'classic'],
        stockLevel: 10,
        isActive: true,
        isFeaturedInMarketplace: true,
        store: Store(
            id: 'store1',
            name: 'Vintage Wears',
            slug: 'vintage-wears',
            logoUrl: '',
            isFeaturedInMarketplace: true,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()),
      ),
      Product(
        id: '2',
        sku: 'SKU002',
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Immerse yourself in music.',
        price: 149.99,
        imageUrls: ['https://picsum.photos/seed/p2/400/400'],
        categories: [
          Category(
              id: 'cat2',
              name: 'Electronics',
              description: '',
              imageUrl: '',
              isFeaturedInMarketplace: true,
              storeId: 'store2',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now())
        ],
        tags: ['headphones', 'audio', 'wireless'],
        stockLevel: 25,
        isActive: true,
        isFeaturedInMarketplace: true,
        store: Store(
            id: 'store2',
            name: 'AudioPhile',
            slug: 'audiophile',
            logoUrl: '',
            isFeaturedInMarketplace: true,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()),
      ),
      Product(
        id: '3',
        sku: 'SKU003',
        name: 'Organic Green Tea',
        description: 'A refreshing and healthy green tea.',
        price: 19.99,
        imageUrls: ['https://picsum.photos/seed/p3/400/400'],
        categories: [
          Category(
              id: 'cat3',
              name: 'Groceries',
              description: '',
              imageUrl: '',
              isFeaturedInMarketplace: true,
              storeId: 'store3',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now())
        ],
        tags: ['tea', 'organic', 'healthy'],
        stockLevel: 100,
        isActive: true,
        isFeaturedInMarketplace: true,
        store: Store(
            id: 'store3',
            name: 'Purely Pantry',
            slug: 'purely-pantry',
            logoUrl: '',
            isFeaturedInMarketplace: true,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()),
      ),
      Product(
        id: '4',
        sku: 'SKU004',
        name: 'Handcrafted Wooden Bowl',
        description: 'A beautiful bowl for your kitchen.',
        price: 49.99,
        imageUrls: ['https://picsum.photos/seed/p4/400/400'],
        categories: [
          Category(
              id: 'cat4',
              name: 'Home Goods',
              description: '',
              imageUrl: '',
              isFeaturedInMarketplace: true,
              storeId: 'store4',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now())
        ],
        tags: ['kitchen', 'wood', 'handmade'],
        stockLevel: 15,
        isActive: true,
        isFeaturedInMarketplace: true,
        store: Store(
            id: 'store4',
            name: 'Artisan Home',
            slug: 'artisan-home',
            logoUrl: '',
            isFeaturedInMarketplace: true,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()),
      ),
      Product(
        id: '5',
        sku: 'SKU005',
        name: 'Yoga Mat',
        description: 'High-quality, non-slip yoga mat.',
        price: 39.99,
        imageUrls: ['https://picsum.photos/seed/p5/400/400'],
        categories: [
          Category(
              id: 'cat5',
              name: 'Sports',
              description: '',
              imageUrl: '',
              isFeaturedInMarketplace: true,
              storeId: 'store5',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now())
        ],
        tags: ['yoga', 'fitness', 'sports'],
        stockLevel: 50,
        isActive: true,
        isFeaturedInMarketplace: true,
        store: Store(
            id: 'store5',
            name: 'Zen Fitness',
            slug: 'zen-fitness',
            logoUrl: '',
            isFeaturedInMarketplace: true,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()),
      ),
      Product(
        id: '6',
        sku: 'SKU006',
        name: 'The Great Gatsby',
        description: 'A classic novel by F. Scott Fitzgerald.',
        price: 14.99,
        imageUrls: ['https://picsum.photos/seed/p6/400/400'],
        categories: [
          Category(
              id: 'cat6',
              name: 'Books',
              description: '',
              imageUrl: '',
              isFeaturedInMarketplace: true,
              storeId: 'store6',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now())
        ],
        tags: ['book', 'classic', 'novel'],
        stockLevel: 200,
        isActive: true,
        isFeaturedInMarketplace: true,
        store: Store(
            id: 'store6',
            name: 'The Book Nook',
            slug: 'the-book-nook',
            logoUrl: '',
            isFeaturedInMarketplace: true,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()),
      ),
      Product(
        id: '7',
        sku: 'SKU007',
        name: 'Gourmet Coffee Beans',
        description: 'Rich and aromatic coffee beans.',
        price: 24.99,
        imageUrls: ['https://picsum.photos/seed/p7/400/400'],
        categories: [
          Category(
              id: 'cat3',
              name: 'Groceries',
              description: '',
              imageUrl: '',
              isFeaturedInMarketplace: true,
              storeId: 'store3',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now())
        ],
        tags: ['coffee', 'gourmet', 'beans'],
        stockLevel: 80,
        isActive: true,
        isFeaturedInMarketplace: true,
        store: Store(
            id: 'store3',
            name: 'Purely Pantry',
            slug: 'purely-pantry',
            logoUrl: '',
            isFeaturedInMarketplace: true,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()),
      ),
      Product(
        id: '8',
        sku: 'SKU008',
        name: 'Smart Watch',
        description: 'Stay connected on the go.',
        price: 249.99,
        imageUrls: ['https://picsum.photos/seed/p8/400/400'],
        categories: [
          Category(
              id: 'cat2',
              name: 'Electronics',
              description: '',
              imageUrl: '',
              isFeaturedInMarketplace: true,
              storeId: 'store2',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now())
        ],
        tags: ['watch', 'smart', 'tech'],
        stockLevel: 30,
        isActive: true,
        isFeaturedInMarketplace: true,
        store: Store(
            id: 'store2',
            name: 'AudioPhile',
            slug: 'audiophile',
            logoUrl: '',
            isFeaturedInMarketplace: true,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Global Marketplace'),
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16.0),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 16.0,
          mainAxisSpacing: 16.0,
          childAspectRatio: 0.75,
        ),
        itemCount: mockProducts.length,
        itemBuilder: (context, index) {
          return ProductCard(product: mockProducts[index]);
        },
      ),
    );
  }
}