import 'product.dart';
import 'store.dart';

class StoreData {
  final Store store;
  final List<Product> featuredProducts;
  final List<Product> products;

  StoreData({
    required this.store,
    required this.featuredProducts,
    required this.products,
  });

  factory StoreData.fromJson(Map<String, dynamic> json) {
    return StoreData(
      store: Store.fromJson(json['store']),
      featuredProducts: (json['featuredProducts'] as List)
          .map((i) => Product.fromJson(i))
          .toList(),
      products:
          (json['products'] as List).map((i) => Product.fromJson(i)).toList(),
    );
  }
}