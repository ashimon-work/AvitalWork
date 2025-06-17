import 'package:flutter/material.dart';
import 'package:global_marketplace_app/screens/home_screen.dart';
import 'package:global_marketplace_app/theme/app_theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Global Marketplace',
      theme: AppTheme.themeData,
      home: const HomeScreen(),
    );
  }
}

