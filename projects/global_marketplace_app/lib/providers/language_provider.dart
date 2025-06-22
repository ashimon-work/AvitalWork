import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageProvider with ChangeNotifier {
  static const String _prefKeyLanguageCode = 'user_language_code';
  Locale _currentLocale = const Locale('en');

  Locale get currentLocale => _currentLocale;

  /// Initialize language provider and load saved language preference
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final savedLanguageCode = prefs.getString(_prefKeyLanguageCode);

    if (savedLanguageCode != null) {
      _currentLocale = Locale(savedLanguageCode);
    } else {
      // Auto-detect device language if supported
      final deviceLocale = PlatformDispatcher.instance.locale;
      if (['en', 'he'].contains(deviceLocale.languageCode)) {
        _currentLocale = deviceLocale;
      } else {
        _currentLocale = const Locale('en'); // Default fallback
      }
      await prefs.setString(_prefKeyLanguageCode, _currentLocale.languageCode);
    }
    notifyListeners();
  }

  /// Set the language and persist the preference
  Future<void> setLanguage(Locale locale) async {
    if (!['en', 'he'].contains(locale.languageCode)) return;
    
    _currentLocale = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefKeyLanguageCode, locale.languageCode);
    
    notifyListeners();
  }

  /// Get the current language code
  String get currentLanguageCode => _currentLocale.languageCode;

  /// Check if current language is RTL
  bool get isRTL => _currentLocale.languageCode == 'he';

  /// Get text direction based on current language
  TextDirection get textDirection => isRTL ? TextDirection.rtl : TextDirection.ltr;

  /// Toggle between supported languages
  Future<void> toggleLanguage() async {
    final newLocale = _currentLocale.languageCode == 'en'
        ? const Locale('he')
        : const Locale('en');
    await setLanguage(newLocale);
  }
} 