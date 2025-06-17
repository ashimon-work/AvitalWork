import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';

class CartService {
  static final CartService _instance = CartService._internal();

  factory CartService() {
    return _instance;
  }

  CartService._internal();

  final Map<String, List<Product>> _carts = {};

  Map<String, List<Product>> get carts => _carts;

  Future<void> addToCart(String storeSlug, Product product) async {
    final url = Uri.parse('https://smartyapp.co.il/api/stores/$storeSlug/cart/add');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'productId': product.id,
        'quantity': 1,
      }),
    );

    if (response.statusCode == 201) {
      final List<dynamic> cartData = jsonDecode(response.body);
      _carts[storeSlug] =
          cartData.map((data) => Product.fromJson(data)).toList();
    } else {
      throw Exception('Failed to add to cart');
    }
  }
}