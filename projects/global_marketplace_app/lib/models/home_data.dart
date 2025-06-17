import 'category.dart';
import 'store.dart';

class HomeData {
  final List<FeaturedProduct> featuredProducts;
  final List<FeaturedCategory> featuredCategories;
  final List<FeaturedStore> featuredStores;

  HomeData({
    required this.featuredProducts,
    required this.featuredCategories,
    required this.featuredStores,
  });

  factory HomeData.fromJson(Map<String, dynamic> json) {
    return HomeData(
      featuredProducts: (json['featuredProducts'] as List)
          .map((i) => FeaturedProduct.fromJson(i))
          .toList(),
      featuredCategories: (json['featuredCategories'] as List)
          .map((i) => FeaturedCategory.fromJson(i))
          .toList(),
      featuredStores: (json['featuredStores'] as List)
          .map((i) => FeaturedStore.fromJson(i))
          .toList(),
    );
  }
}

class FeaturedProduct {
  final String id;
  final String sku;
  final String name;
  final String description;
  final double price;
  final List<String> imageUrls;
  final List<Category> categories;
  final List<String> tags;
  final int stockLevel;
  final Store store;

  FeaturedProduct({
    required this.id,
    required this.sku,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrls,
    required this.categories,
    required this.tags,
    required this.stockLevel,
    required this.store,
  });

  factory FeaturedProduct.fromJson(Map<String, dynamic> json) {
    return FeaturedProduct(
      id: json['id'],
      sku: json['sku'],
      name: json['name'],
      description: json['description'],
      price: (json['price'] as num).toDouble(),
      imageUrls: List<String>.from(json['imageUrls']),
      categories: (json['categories'] as List)
          .map((i) => Category.fromJson(i))
          .toList(),
      tags: List<String>.from(json['tags']),
      stockLevel: json['stockLevel'],
      store: Store.fromJson(json['store']),
    );
  }
}

class FeaturedCategory {
  final String id;
  final String name;
  final String? imageUrl;

  FeaturedCategory({
    required this.id,
    required this.name,
    this.imageUrl,
  });

  factory FeaturedCategory.fromJson(Map<String, dynamic> json) {
    return FeaturedCategory(
      id: json['id'],
      name: json['name'],
      imageUrl: json['imageUrl'],
    );
  }
}

class FeaturedStore {
  final String id;
  final String name;
  final String? logoUrl;

  FeaturedStore({
    required this.id,
    required this.name,
    this.logoUrl,
  });

  factory FeaturedStore.fromJson(Map<String, dynamic> json) {
    return FeaturedStore(
      id: json['id'],
      name: json['name'],
      logoUrl: json['logoUrl'],
    );
  }
}