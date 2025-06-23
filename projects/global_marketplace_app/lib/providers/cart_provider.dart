import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product.dart';
import '../models/cart_item.dart';

class CartProvider extends ChangeNotifier {
  final Map<String, List<CartItem>> _carts = {};
  bool _isLoading = false;
  String? _error;
  String? _guestSessionId;

  CartProvider() {
    _loadGuestSessionId();
  }

  Future<void> _loadGuestSessionId() async {
    final prefs = await SharedPreferences.getInstance();
    _guestSessionId = prefs.getString('guestSessionId');
    notifyListeners();
  }

  Future<void> _setGuestSessionId(String guestSessionId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('guestSessionId', guestSessionId);
    _guestSessionId = guestSessionId;
  }

  Map<String, List<CartItem>> get carts => Map.unmodifiable(_carts);
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isEmpty => _carts.isEmpty || getTotalItemCount() == 0;

  // Get total number of items across all carts
  int getTotalItemCount() {
    return _carts.values.fold(0, (total, items) => 
        total + items.fold(0, (sum, item) => sum + item.quantity));
  }

  // Get cart items for a specific store
  List<CartItem> getCartItemsForStore(String storeSlug) {
    return _carts[storeSlug] ?? [];
  }

  Future<void> addToCart(String storeSlug, Product product, int quantity, String? token) async {
    _setLoading(true);
    _clearError();

    try {
      final newQuantity = (getCartItemsForStore(storeSlug)
          .where((item) => item.product.id == product.id)
          .firstOrNull?.quantity ?? 0) + quantity;

      final url = Uri.parse('https://smartyapp.co.il/api/stores/$storeSlug/cart/add');
      
      final headers = {
        'Content-Type': 'application/json',
      };

      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      } else if (_guestSessionId != null) {
        headers['x-guest-session-id'] = _guestSessionId!;
      } else {
        // Let the backend create a new session if one doesn't exist
      }

      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'productId': product.id,
          'quantity': newQuantity,
        }),
      );

      if (response.statusCode == 201) {
        final List<dynamic> cartsData = jsonDecode(response.body);
        
        for (var cartData in cartsData) {
          final storeSlug = cartData['store']['slug'];
          final List<dynamic> itemsData = cartData['items'];
          _carts[storeSlug] = itemsData.map((data) => CartItem.fromJson(data)).toList();
        }

        if (token == null && cartsData.isNotEmpty && cartsData.first.containsKey('guest_session_id')) {
          final newGuestSessionId = cartsData.first['guest_session_id'];
          if (newGuestSessionId != null) {
            await _setGuestSessionId(newGuestSessionId);
          }
        }
        
        notifyListeners();
      } else if (response.statusCode == 401) {
        _setError('Please log in to add items to cart');
      } else {
        _setError('Failed to add to cart: ${response.statusCode}');
      }
    } catch (e) {
      _setError('Failed to add to cart: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshCarts(String? token) async {
    if (token == null && _guestSessionId == null) {
      _carts.clear();
      notifyListeners();
      return;
    }

    _setLoading(true);

    try {
      final url = token != null
          ? Uri.parse('https://smartyapp.co.il/api/account/carts')
          : Uri.parse('https://smartyapp.co.il/api/guest/carts');
      final headers = {
        'Content-Type': 'application/json',
      };
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      } else if (_guestSessionId != null) {
        headers['x-guest-session-id'] = _guestSessionId!;
      }

      final response = await http.get(
        url,
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> cartsData = jsonDecode(response.body);
        _carts.clear();
        for (var cartData in cartsData) {
          final storeSlug = cartData['store']['slug'];
          final List<dynamic> itemsData = cartData['items'];
          _carts[storeSlug] = itemsData.map((data) => CartItem.fromJson(data)).toList();
        }
        _clearError();
        notifyListeners();
      } else if (response.statusCode == 401) {
        // Token expired, clear carts
        _carts.clear();
        _setError('Session expired, please log in again');
        notifyListeners();
      } else {
        _setError('Failed to fetch user carts: ${response.statusCode}');
      }
    } catch (e) {
      // Don't clear carts on network error, just set error
      _setError('Failed to refresh carts: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> removeFromCart(String storeSlug, String productId, String? token) async {
    _setLoading(true);
    _clearError();

    try {
      final url = Uri.parse('https://smartyapp.co.il/api/stores/$storeSlug/cart/remove');
      
      final headers = {
        'Content-Type': 'application/json',
      };
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      } else if (_guestSessionId != null) {
        headers['x-guest-session-id'] = _guestSessionId!;
      }

      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'productId': productId,
        }),
      );

      if (response.statusCode == 200) {
        final cartData = jsonDecode(response.body);
        final List<dynamic> items = cartData['items'];
        _carts[storeSlug] = items.map((data) => CartItem.fromJson(data)).toList();
        notifyListeners();
      } else if (response.statusCode == 401) {
        _setError('Please log in to modify cart');
      } else {
        _setError('Failed to remove from cart: ${response.statusCode}');
      }
    } catch (e) {
      _setError('Failed to remove from cart: $e');
    } finally {
      _setLoading(false);
    }
  }

  void clearCartForStore(String storeSlug) {
    _carts.remove(storeSlug);
    notifyListeners();
  }

  void clearAllCarts() {
    _carts.clear();
    notifyListeners();
  }

  void clearError() {
    _clearError();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
} 