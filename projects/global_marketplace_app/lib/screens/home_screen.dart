import 'package:flutter/material.dart';
import 'package:global_marketplace_app/models/home_data.dart';
import 'package:global_marketplace_app/services/api_service.dart';
import 'package:global_marketplace_app/models/product.dart';
import 'package:global_marketplace_app/screens/store_screen.dart';
import 'package:global_marketplace_app/widgets/product_grid.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  HomeScreenState createState() => HomeScreenState();
}

class HomeScreenState extends State<HomeScreen> {
  late Future<HomeData> _homeDataFuture;

  @override
  void initState() {
    super.initState();
    _homeDataFuture = ApiService().fetchHomeData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFFFFF),
      appBar: AppBar(
        title: const Text(
          'Global Marketplace',
          style: TextStyle(fontFamily: 'Lato'),
        ),
        backgroundColor: const Color(0xFF0A4F70),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () {
                  // TODO: Implement cart functionality
                },
              ),
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFC107),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 16,
                    minHeight: 16,
                  ),
                  child: const Text(
                    '2', // Example cart count
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Search Bar
              _buildSearchBar(),
              const SizedBox(height: 24),

              // 2. Featured Categories
              _buildSectionTitle('Featured Categories'),
              const SizedBox(height: 16),
              _buildFeaturedCategories(),
              const SizedBox(height: 24),

              // 3. Featured Products
              _buildSectionTitle('Featured Products'),
              const SizedBox(height: 16),
              _buildFeaturedProducts(),
              const SizedBox(height: 24),

              // 4. Top Stores
              _buildSectionTitle('Top Stores'),
              const SizedBox(height: 16),
              _buildTopStores(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: const TextField(
        style: TextStyle(fontFamily: 'Lato'),
        decoration: InputDecoration(
          icon: Icon(Icons.search_outlined),
          hintText: 'Discover unique, handcrafted goods...',
          hintStyle: TextStyle(fontFamily: 'Lato'),
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontFamily: 'Lato',
        fontSize: 20,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildFeaturedCategories() {
    // Placeholder data
    final categories = ['Pottery', 'Jewelry', 'Textiles', 'Woodcraft', 'Art'];
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        itemBuilder: (context, index) {
          return Chip(
            label: Text(categories[index], style: const TextStyle(fontFamily: 'Lato')),
            backgroundColor: index == 0 ? const Color(0xFFFFC107) : const Color(0xFFF5F5F5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
              side: const BorderSide(color: Colors.grey),
            ),
          );
        },
        separatorBuilder: (context, index) => const SizedBox(width: 8),
      ),
    );
  }

  Widget _buildFeaturedProducts() {
    return FutureBuilder<HomeData>(
      future: _homeDataFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        } else if (snapshot.hasData) {
          final products = snapshot.data!.featuredProducts
              .map((p) => Product(
                    id: p.id,
                    sku: p.sku,
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    imageUrls: p.imageUrls,
                    categories: p.categories,
                    tags: p.tags,
                    stockLevel: p.stockLevel,
                    isActive: true,
                    isFeaturedInMarketplace: true,
                    store: p.store,
                  ))
              .toList();

          return ProductGrid(products: products);
        } else {
          return const Center(child: Text('No products available'));
        }
      },
    );
  }

  Widget _buildTopStores() {
    return FutureBuilder<HomeData>(
      future: _homeDataFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        } else if (snapshot.hasData) {
          final stores = snapshot.data!.featuredStores;
          return SizedBox(
            height: 120,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: stores.length,
              itemBuilder: (context, index) {
                final store = stores[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            StoreScreen(storeSlug: store.id),
                      ),
                    );
                  },
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 40,
                        backgroundImage: store.logoUrl != null
                            ? NetworkImage(store.logoUrl!)
                            : null,
                        child: store.logoUrl == null
                            ? const Icon(Icons.store,
                                size: 40, color: Colors.grey)
                            : null,
                      ),
                      const SizedBox(height: 8),
                      Text(store.name,
                          style: const TextStyle(fontFamily: 'Lato')),
                    ],
                  ),
                );
              },
              separatorBuilder: (context, index) => const SizedBox(width: 16),
            ),
          );
        } else {
          return const Center(child: Text('No stores available'));
        }
      },
    );
  }
}
