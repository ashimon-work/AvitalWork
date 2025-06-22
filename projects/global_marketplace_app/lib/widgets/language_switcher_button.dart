import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:global_marketplace_app/providers/language_provider.dart';
import 'package:global_marketplace_app/widgets/language_bottom_sheet.dart';

class LanguageSwitcherButton extends StatelessWidget {
  const LanguageSwitcherButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<LanguageProvider>(
      builder: (context, languageProvider, child) {
        final currentLocale = languageProvider.currentLanguageCode;
        
        return IconButton(
          onPressed: () => LanguageBottomSheet.show(context),
          icon: Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: Theme.of(context).dividerColor,
                width: 1,
              ),
            ),
            child: ClipOval(
              child: Container(
                color: currentLocale == 'he' 
                    ? Colors.blue.shade700 
                    : Colors.red.shade700,
                child: Center(
                  child: Text(
                    currentLocale == 'he' ? '🇮🇱' : '🇺🇸',
                    style: const TextStyle(fontSize: 16),
                  ),
                ),
              ),
            ),
          ),
          tooltip: 'Change Language',
        );
      },
    );
  }
} 