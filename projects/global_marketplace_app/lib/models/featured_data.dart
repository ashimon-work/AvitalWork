import 'product.dart';
import 'category.dart';
import 'store.dart';

class FeaturedData {
  final List<Product> products;
  final List<Category> categories;
  final List<Store> stores;

  FeaturedData({required this.products, required this.categories, required this.stores});

  factory FeaturedData.fromJson(Map<String, dynamic> json) {
    return FeaturedData(
      products: (json['featuredProducts'] as List).map((i) => Product.fromJson(i)).toList(),
      categories: (json['featuredCategories'] as List).map((i) => Category.fromJson(i)).toList(),
      stores: (json['featuredStores'] as List).map((i) => Store.fromJson(i)).toList(),
    );
  }
}