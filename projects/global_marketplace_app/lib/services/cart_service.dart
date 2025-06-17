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

  Future<void> fetchUserCarts() async {
    // TODO: get the real token
    const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjYxYjg5ODQ1ZTU2MjgxNTcyN2U4MmUiLCJpYXQiOjE3MTc4Mjc0NTIsImV4cCI6MTcxNzg1NjI1Mn0.eQ3t5e4p4EE2FUfPz_1nMg8u_2kXy-v2i_pG-6-yGgA';
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