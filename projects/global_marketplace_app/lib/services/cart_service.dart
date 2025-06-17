import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../models/cart_item.dart';
import './auth_service.dart';

class CartService {
  static final CartService _instance = CartService._internal();
  final AuthService _authService = AuthService();

  factory CartService() {
    return _instance;
  }

  CartService._internal();

  final Map<String, List<CartItem>> _carts = {};

  Map<String, List<CartItem>> get carts => _carts;

  Future<void> addToCart(String storeSlug, Product product, int quantity) async {
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
        'quantity': quantity,
      }),
    );

    if (response.statusCode == 201) {
      final cartData = jsonDecode(response.body);
      final List<dynamic> items = cartData['items'];
      _carts[storeSlug] =
          items.map((data) => CartItem.fromJson(data)).toList();
    } else {
      throw Exception('Failed to add to cart');
    }
  }

  Future<void> refreshCarts() async {
    final token = await _authService.getToken();
    if (token == null) {
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
        final List<dynamic> itemsData = cartData['items'];
        _carts[storeSlug] =
            itemsData.map((data) => CartItem.fromJson(data)).toList();
      }
    } else {
      throw Exception('Failed to fetch user carts');
    }
  }

  List<CartItem> getCartItemsForStore(String storeSlug) {
    return _carts[storeSlug] ?? [];
  }

  void clearCartForStore(String storeSlug) {
    _carts.remove(storeSlug);
  }
}