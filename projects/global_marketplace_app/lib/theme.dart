import 'package:flutter/material.dart';

const primaryColor = Color(0xFF0A4F70);
const accentColor = Color(0xFFFFC107);
const backgroundColor = Color(0xFFFFFFFF);
const lightGrayColor = Color(0xFFF5F5F5);

final ThemeData globalMarketplaceTheme = ThemeData(
  primaryColor: primaryColor,
  colorScheme: ColorScheme.fromSwatch().copyWith(
    primary: primaryColor,
    secondary: accentColor,
    background: backgroundColor,
    surface: lightGrayColor,
  ),
  scaffoldBackgroundColor: backgroundColor,
  fontFamily: 'Lato',
  textTheme: const TextTheme(
    displayLarge: TextStyle(fontSize: 57.0, fontWeight: FontWeight.bold),
    displayMedium: TextStyle(fontSize: 45.0, fontWeight: FontWeight.bold),
    displaySmall: TextStyle(fontSize: 36.0, fontWeight: FontWeight.bold),
    headlineLarge: TextStyle(fontSize: 32.0, fontWeight: FontWeight.bold),
    headlineMedium: TextStyle(fontSize: 28.0, fontWeight: FontWeight.bold),
    headlineSmall: TextStyle(fontSize: 24.0, fontWeight: FontWeight.bold),
    titleLarge: TextStyle(fontSize: 22.0, fontWeight: FontWeight.bold),
    titleMedium: TextStyle(fontSize: 16.0, fontWeight: FontWeight.w500),
    titleSmall: TextStyle(fontSize: 14.0, fontWeight: FontWeight.w500),
    bodyLarge: TextStyle(fontSize: 16.0),
    bodyMedium: TextStyle(fontSize: 14.0),
    bodySmall: TextStyle(fontSize: 12.0),
    labelLarge: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
    labelMedium: TextStyle(fontSize: 12.0, fontWeight: FontWeight.bold),
    labelSmall: TextStyle(fontSize: 11.0, fontWeight: FontWeight.bold),
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: primaryColor,
    elevation: 4.0,
    iconTheme: IconThemeData(color: Colors.white),
    titleTextStyle: TextStyle(
      fontFamily: 'Lato',
      fontSize: 20.0,
      fontWeight: FontWeight.bold,
      color: Colors.white,
    ),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: accentColor,
      foregroundColor: Colors.black,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8.0),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      textStyle: const TextStyle(
        fontFamily: 'Lato',
        fontWeight: FontWeight.bold,
      ),
    ),
  ),
  cardTheme: CardTheme(
    elevation: 2.0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12.0),
    ),
    shadowColor: Colors.black.withOpacity(0.1),
    margin: const EdgeInsets.all(8.0),
  ),
  iconTheme: const IconThemeData(
    color: primaryColor,
  ),
  useMaterial3: true,
);