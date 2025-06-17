import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import './auth_service.dart';

class CartService {
  static final CartService _instance = CartService._internal();
  final AuthService _authService = AuthService();

  factory CartService() {
    return _instance;
  }

  CartService._internal();

  final Map<String, List<Product>> _carts = {};

  Map<String, List<Product>> get carts => _carts;

  Future<void> addToCart(String storeSlug, Product product) async {
    final url = Uri.parse('https://smartyapp.co.il/api/stores/$storeSlug/cart/add');
    final token = await _authService.getToken();
    
    final headers = {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };

    final response = await http.post(
      url,
      headers: headers,
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

  Future<void> refreshCarts() async {
    final token = await _authService.getToken();
    if (token == null) {
      // Handle guest cart if necessary, for now, we clear it.
      _carts.clear();
      return;
    }

    final url = Uri.parse('https://smartyapp.co.il/api/account/carts');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> cartsData = jsonDecode(response.body);
      _carts.clear();
      for (var cartData in cartsData) {
        final storeSlug = cartData['store']['slug'];
        final List<dynamic> productData = cartData['products'];
        _carts[storeSlug] =
            productData.map((data) => Product.fromJson(data)).toList();
      }
    } else {
      throw Exception('Failed to fetch user carts');
    }
  }
}