import '../models/product.dart';

class CartService {
  static final CartService _instance = CartService._internal();

  factory CartService() {
    return _instance;
  }

  CartService._internal();

  final Map<String, List<Product>> _carts = {};

  Map<String, List<Product>> get carts => _carts;

  void addToCart(String storeSlug, Product product) {
    if (_carts.containsKey(storeSlug)) {
      _carts[storeSlug]!.add(product);
    } else {
      _carts[storeSlug] = [product];
    }
  }
}