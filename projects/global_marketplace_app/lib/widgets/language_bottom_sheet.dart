import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:global_marketplace_app/providers/language_provider.dart';
import 'package:global_marketplace_app/l10n/app_localizations.dart';

class LanguageBottomSheet extends StatelessWidget {
  const LanguageBottomSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const LanguageBottomSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Theme.of(context).dividerColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            
            // Title
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                l10n.changeLanguage,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            
            // Language options
            Consumer<LanguageProvider>(
              builder: (context, languageProvider, child) {
                return Column(
                  children: [
                    _buildLanguageOption(
                      context: context,
                      languageProvider: languageProvider,
                      locale: const Locale('en'),
                      title: l10n.en,
                      flag: '🇺🇸',
                      isSelected: languageProvider.currentLanguageCode == 'en',
                    ),
                    _buildLanguageOption(
                      context: context,
                      languageProvider: languageProvider,
                      locale: const Locale('he'),
                      title: l10n.he,
                      flag: '🇮🇱',
                      isSelected: languageProvider.currentLanguageCode == 'he',
                    ),
                  ],
                );
              },
            ),
            
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageOption({
    required BuildContext context,
    required LanguageProvider languageProvider,
    required Locale locale,
    required String title,
    required String flag,
    required bool isSelected,
  }) {
    return InkWell(
      onTap: () async {
        await languageProvider.setLanguage(locale);
        if (context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Flag
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: Theme.of(context).dividerColor,
                  width: 1,
                ),
              ),
              child: Center(
                child: Text(
                  flag,
                  style: const TextStyle(fontSize: 20),
                ),
              ),
            ),
            
            const SizedBox(width: 16),
            
            // Language name
            Expanded(
              child: Text(
                title,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
            
            // Selection indicator
            if (isSelected)
              Icon(
                Icons.check_circle,
                color: Theme.of(context).primaryColor,
                size: 24,
              ),
          ],
        ),
      ),
    );
  }
} 