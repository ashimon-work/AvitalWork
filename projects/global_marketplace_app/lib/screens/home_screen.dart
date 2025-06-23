import 'package:flutter/material.dart';
import 'package:global_marketplace_app/models/home_data.dart';
import 'package:global_marketplace_app/services/api_service.dart';
import 'package:global_marketplace_app/models/product.dart';
import 'package:global_marketplace_app/screens/store_screen.dart';
import 'package:global_marketplace_app/widgets/product_grid.dart';
import 'package:global_marketplace_app/widgets/common_app_bar.dart';
import 'package:global_marketplace_app/l10n/app_localizations.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  HomeScreenState createState() => HomeScreenState();
}

class HomeScreenState extends State<HomeScreen> {
  late Future<HomeData> _homeDataFuture;
  String? _selectedCategoryId;
  List<Product> _filteredProducts = [];
  List<Product> _allProducts = [];
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _homeDataFuture = ApiService().fetchHomeData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onCategorySelected(String? categoryId, String categoryName) {
    setState(() {
      _selectedCategoryId = categoryId;
      _filterProducts();
    });
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query.toLowerCase();
      _filterProducts();
    });
  }

  void _filterProducts() {
    _filteredProducts = _allProducts.where((product) {
      // Apply search filter
      bool matchesSearch = _searchQuery.isEmpty ||
          product.name.toLowerCase().contains(_searchQuery) ||
          product.description.toLowerCase().contains(_searchQuery) ||
          product.store.name.toLowerCase().contains(_searchQuery) ||
          product.tags.any((tag) => tag.toLowerCase().contains(_searchQuery));

      // Apply category filter
      bool matchesCategory = _selectedCategoryId == null ||
          product.categories.any((cat) => 
              _selectedCategoryId == cat.id || 
              (_selectedCategoryId == cat.name && cat.name.toLowerCase() == _selectedCategoryId!.toLowerCase()));

      return matchesSearch && matchesCategory;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    return Scaffold(
      backgroundColor: const Color(0xFFFFFFFF),
      appBar: CommonAppBar(title: l10n.appTitle),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Search Bar
              _buildSearchBar(l10n),
              const SizedBox(height: 24),

              // 2. Featured Categories
              _buildSectionTitle(l10n.categories),
              const SizedBox(height: 16),
              _buildFeaturedCategories(),
              const SizedBox(height: 24),

              // 3. Featured Products
              _buildSectionTitle(l10n.featured),
              const SizedBox(height: 16),
              _buildFeaturedProducts(),
              const SizedBox(height: 24),

              // 4. Top Stores
              _buildSectionTitle(l10n.stores),
              const SizedBox(height: 16),
              _buildTopStores(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBar(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(25),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        style: const TextStyle(fontFamily: 'Lato'),
        decoration: InputDecoration(
          icon: const Icon(Icons.search_outlined),
          hintText: l10n.searchProducts,
          hintStyle: const TextStyle(fontFamily: 'Lato'),
          border: InputBorder.none,
        ),
        onChanged: _onSearchChanged,
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
    final l10n = AppLocalizations.of(context)!;
    return FutureBuilder<HomeData>(
      future: _homeDataFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const SizedBox(
            height: 40,
            child: Center(child: CircularProgressIndicator()),
          );
        } else if (snapshot.hasError) {
          return Center(child: Text(l10n.errorLoading(snapshot.error.toString())));
        } else if (snapshot.hasData) {
          final categories = snapshot.data!.featuredCategories;
          if (categories.isEmpty) {
            // Fallback to placeholder data if no categories from API
            final placeholderCategories = ['All', 'Pottery', 'Jewelry', 'Textiles', 'Woodcraft', 'Art'];
            return SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: placeholderCategories.length,
                itemBuilder: (context, index) {
                  final categoryName = placeholderCategories[index];
                  final isSelected = index == 0 ? _selectedCategoryId == null : _selectedCategoryId == categoryName;
                  
                  return GestureDetector(
                    onTap: () {
                      _onCategorySelected(index == 0 ? null : categoryName, categoryName);
                    },
                    child: Chip(
                      label: Text(categoryName, style: const TextStyle(fontFamily: 'Lato')),
                      backgroundColor: isSelected ? const Color(0xFFFFC107) : const Color(0xFFF5F5F5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(color: Colors.grey),
                      ),
                    ),
                  );
                },
                separatorBuilder: (context, index) => const SizedBox(width: 8),
              ),
            );
          }
          
          // Add "All" option at the beginning for real categories
          final allCategories = [
            {'id': null, 'name': l10n.all},
            ...categories.map((cat) => {'id': cat.id, 'name': cat.name})
          ];
          
          return SizedBox(
            height: 40,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: allCategories.length,
              itemBuilder: (context, index) {
                final categoryData = allCategories[index];
                final categoryId = categoryData['id'];
                final categoryName = categoryData['name'] as String;
                final isSelected = _selectedCategoryId == categoryId;
                
                return GestureDetector(
                  onTap: () {
                    _onCategorySelected(categoryId, categoryName);
                  },
                  child: Chip(
                    label: Text(categoryName, style: const TextStyle(fontFamily: 'Lato')),
                    backgroundColor: isSelected ? const Color(0xFFFFC107) : const Color(0xFFF5F5F5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: const BorderSide(color: Colors.grey),
                    ),
                  ),
                );
              },
              separatorBuilder: (context, index) => const SizedBox(width: 8),
            ),
          );
        } else {
          return Center(child: Text(l10n.noCategoriesAvailable));
        }
      },
    );
  }

  Widget _buildFeaturedProducts() {
    final l10n = AppLocalizations.of(context)!;
    return FutureBuilder<HomeData>(
      future: _homeDataFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text(l10n.errorLoading(snapshot.error.toString())));
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

          // Initialize products if not already done
          if (_allProducts.isEmpty) {
            _allProducts = products;
            _filteredProducts = products;
          }

          // Use filtered products if search or category is applied, otherwise show all products
          final displayProducts = (_searchQuery.isNotEmpty || _selectedCategoryId != null) 
              ? _filteredProducts 
              : products;

          return ProductGrid(products: displayProducts);
        } else {
          return Center(child: Text(l10n.noProductsAvailable));
        }
      },
    );
  }

  Widget _buildTopStores() {
    final l10n = AppLocalizations.of(context)!;
    return FutureBuilder<HomeData>(
      future: _homeDataFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text(l10n.errorLoading(snapshot.error.toString())));
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
                            StoreScreen(storeSlug: store.slug),
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
          return Center(child: Text(l10n.noStoresAvailable));
        }
      },
    );
  }
}
