import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

final ThemeData appTheme = ThemeData(
  primaryColor: const Color(0xFF6200EE),
  colorScheme: ColorScheme.fromSwatch().copyWith(
    primary: const Color(0xFF6200EE),
    secondary: const Color(0xFF03DAC6),
    surface: const Color(0xFFFFFFFF),
  ),
  scaffoldBackgroundColor: const Color(0xFFFFFFFF),
  textTheme: TextTheme(
    titleLarge: GoogleFonts.montserrat(
      color: const Color(0xFF212121),
      fontWeight: FontWeight.bold,
    ),
    bodyMedium: GoogleFonts.montserrat(
      color: const Color(0xFF212121),
    ),
    titleMedium: GoogleFonts.montserrat(
      color: const Color(0xFF757575),
    ),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: const Color(0xFF6200EE),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    ),
  ),
  cardTheme: CardThemeData(
    elevation: 4,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  ),
);
