import 'product.dart';

class HomeData {
  final List<Product> featuredProducts;
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
          .map((i) => Product.fromJson(i))
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