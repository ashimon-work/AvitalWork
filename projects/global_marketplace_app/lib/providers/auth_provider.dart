import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  
  bool _isLoggedIn = false;
  bool _isLoading = false;
  String? _userToken;
  String? _error;

  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  String? get userToken => _userToken;
  String? get error => _error;

  AuthProvider() {
    _initializeAuth();
  }

  Future<void> _initializeAuth() async {
    _setLoading(true);
    try {
      final token = await _authService.getToken();
      _userToken = token;
      _isLoggedIn = token != null;
      _error = null;
    } catch (e) {
      _error = e.toString();
      _isLoggedIn = false;
      _userToken = null;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _error = null;
    
    try {
      final success = await _authService.login(email, password);
      if (success) {
        final token = await _authService.getToken();
        _userToken = token;
        _isLoggedIn = true;
        _error = null;
        notifyListeners();
        return true;
      } else {
        _error = 'Login failed';
        _isLoggedIn = false;
        _userToken = null;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoggedIn = false;
      _userToken = null;
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    try {
      await _authService.logout();
      _isLoggedIn = false;
      _userToken = null;
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _setLoading(false);
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
} 