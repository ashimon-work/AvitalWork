import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/providers.dart';
import '../screens/shopping_cart_screen.dart';
import '../screens/login_screen.dart';
import '../widgets/language_switcher_button.dart';
import '../l10n/app_localizations.dart';

class CommonAppBar extends StatefulWidget implements PreferredSizeWidget {
  final String title;
  final bool showBackButton;

  const CommonAppBar({
    super.key,
    required this.title,
    this.showBackButton = false,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  State<CommonAppBar> createState() => _CommonAppBarState();
}

class _CommonAppBarState extends State<CommonAppBar> {
  Future<void> _navigateToLogin() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const LoginScreen(),
      ),
    );
  }

  Future<void> _logout() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    
    await authProvider.logout();
    cartProvider.clearAllCarts();
  }

  Future<void> _navigateToCart() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const ShoppingCartScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    return Consumer2<AuthProvider, CartProvider>(
      builder: (context, authProvider, cartProvider, child) {
        final cartItemCount = cartProvider.getTotalItemCount();
        final isLoggedIn = authProvider.isLoggedIn;

        return AppBar(
          title: Text(
            widget.title,
            style: const TextStyle(fontFamily: 'Lato'),
          ),
          backgroundColor: const Color(0xFF0A4F70),
          leading: widget.showBackButton
              ? IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.of(context).pop(),
                )
              : null,
          actions: [
            // Language Switcher
            const LanguageSwitcherButton(),
            // Login/Logout Button
            IconButton(
              onPressed: isLoggedIn ? _logout : _navigateToLogin,
              icon: const Icon(
                Icons.person,
                color: Colors.white,
              ),
              tooltip: isLoggedIn ? l10n.logout : l10n.login,
            ),
            // Cart Button
            Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined),
                  onPressed: _navigateToCart,
                ),
                if (cartItemCount > 0)
                  Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFC107),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        cartItemCount.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        );
      },
    );
  }
} 