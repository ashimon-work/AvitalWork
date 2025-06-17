import 'category.dart';
import 'store.dart';

class Product {
  final String id;
  final String sku;
  final String name;
  final String description;
  final String price;
  final List<String> imageUrls;
  final List<Category> categories;
  final List<String> tags;
  final List<String>? options;
  final int stockLevel;
  final bool isActive;
  final bool isFeaturedInMarketplace;
  final Store store;

  Product({
    required this.id,
    required this.sku,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrls,
    required this.categories,
    required this.tags,
    this.options,
    required this.stockLevel,
    required this.isActive,
    required this.isFeaturedInMarketplace,
    required this.store,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      sku: json['sku'],
      name: json['name'],
      description: json['description'],
      price: json['price'],
      imageUrls: List<String>.from(json['imageUrls']),
      categories: (json['categories'] as List? ?? [])
          .map((i) => Category.fromJson(i))
          .toList(),
      tags: List<String>.from(json['tags']),
      options: json['options'] != null ? List<String>.from(json['options']) : null,
      stockLevel: json['stockLevel'],
      isActive: json['isActive'],
      isFeaturedInMarketplace: json['isFeaturedInMarketplace'],
      store: Store.fromJson(json['store']),
    );
  }

  String get firstImageUrl => imageUrls.isNotEmpty ? imageUrls.first : '';
}