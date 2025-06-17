import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Color Palette
  static const Color primaryColor = Color(0xFF0A4F70); // Deep Teal/Blue
  static const Color accentColor = Color(0xFFFFC107); // Warm Gold
  static const Color neutralOffWhite = Color(0xFFFFFFFF);
  static const Color neutralLightGrey = Color(0xFFF5F5F5);

  // Typography (using Lato)
  static final TextTheme textTheme = TextTheme(
    titleLarge: GoogleFonts.lato(
      fontSize: 20,
      fontWeight: FontWeight.bold,
      color: primaryColor,
    ),
    bodyLarge: GoogleFonts.lato(
      fontSize: 16,
      color: Colors.black87,
    ),
    bodyMedium: GoogleFonts.lato(
      fontSize: 14,
      color: Colors.black54,
    ),
    labelLarge: GoogleFonts.lato(
      fontSize: 16,
      fontWeight: FontWeight.bold,
      color: Colors.white,
    ),
  );

  // Component Styling
  static final ThemeData themeData = ThemeData(
    primaryColor: primaryColor,
    colorScheme: ColorScheme.fromSwatch().copyWith(
      primary: primaryColor,
      secondary: accentColor,
      surface: neutralOffWhite,
      background: neutralOffWhite,
    ),
    scaffoldBackgroundColor: neutralOffWhite,
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: primaryColor,
      elevation: 4,
      iconTheme: const IconThemeData(color: Colors.white),
      titleTextStyle: GoogleFonts.lato(
        fontSize: 22,
        fontWeight: FontWeight.bold,
        color: Colors.white,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: textTheme.labelLarge,
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 4,
      margin: const EdgeInsets.all(8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      color: neutralLightGrey,
    ),
    iconTheme: const IconThemeData(
      color: primaryColor,
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: accentColor, width: 2),
      ),
    ),
  );
}
