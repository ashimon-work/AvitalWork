import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:global_marketplace_app/screens/home_screen.dart';
import 'package:global_marketplace_app/theme/app_theme.dart';
import 'package:global_marketplace_app/providers/providers.dart';
import 'package:global_marketplace_app/l10n/app_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (context) => LanguageProvider()..init(),
        ),
        ChangeNotifierProvider(
          create: (context) => AuthProvider(),
        ),
        ChangeNotifierProxyProvider<AuthProvider, CartProvider>(
          create: (context) => CartProvider(),
          update: (context, authProvider, cartProvider) {
            // When auth state changes, refresh cart
            if (cartProvider != null) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                cartProvider.refreshCarts(authProvider.userToken);
              });
            }
            return cartProvider ?? CartProvider();
          },
        ),
      ],
      child: Consumer<LanguageProvider>(
        builder: (context, languageProvider, child) {
          return MaterialApp(
            title: 'Global Marketplace',
            theme: AppTheme.themeData,
            locale: languageProvider.currentLocale,
            supportedLocales: const [
              Locale('en'),
              Locale('he'),
            ],
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            home: const HomeScreen(),
          );
        },
      ),
    );
  }
}

