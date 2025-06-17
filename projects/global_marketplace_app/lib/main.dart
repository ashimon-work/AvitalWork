import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:global_marketplace_app/screens/home_screen.dart';
import 'package:global_marketplace_app/theme/app_theme.dart';
import 'package:global_marketplace_app/providers/providers.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
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
      child: MaterialApp(
        title: 'Global Marketplace',
        theme: AppTheme.themeData,
        home: const HomeScreen(),
      ),
    );
  }
}

