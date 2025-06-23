import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/cart_item.dart';
import 'package:global_marketplace_app/l10n/app_localizations.dart';
import '../providers/providers.dart';
import 'shipping_address_screen.dart';
import '../theme/app_theme.dart';
import '../widgets/common_app_bar.dart';

class ShoppingCartScreen extends StatefulWidget {
  const ShoppingCartScreen({super.key});

  @override
  State<ShoppingCartScreen> createState() => _ShoppingCartScreenState();
}

class _ShoppingCartScreenState extends State<ShoppingCartScreen> {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: AppTheme.neutralOffWhite,
      appBar: CommonAppBar(
        title: l10n.shoppingCart,
        showBackButton: true,
      ),
      body: Consumer<CartProvider>(
        builder: (context, cartProvider, child) {
          if (cartProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (cartProvider.error != null) {
            return Center(child: Text(l10n.failedToLoadCart(cartProvider.error!)));
          } else if (cartProvider.isEmpty) {
            return _buildEmptyState(l10n);
          } else {
            return _buildMultiStoreCart(cartProvider, l10n);
          }
        },
      ),
    );
  }

  Widget _buildEmptyState(AppLocalizations l10n) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 64.0,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16.0),
          Text(
            l10n.yourCartIsEmpty,
            style: TextStyle(
              fontFamily: 'Lato',
              fontSize: 18.0,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMultiStoreCart(CartProvider cartProvider, AppLocalizations l10n) {
    final stores = cartProvider.carts.keys.toList();
    return ListView.builder(
      padding: const EdgeInsets.all(8.0),
      itemCount: stores.length,
      itemBuilder: (context, index) {
        final storeName = stores[index];
        final cartItems = cartProvider.carts[storeName]!;
        final subtotal = cartItems.fold(0.0, (sum, item) => sum + (item.product.price * item.quantity));

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildStoreHeader(storeName),
                const SizedBox(height: 12.0),
                _buildCartItemsList(cartItems),
                const Divider(),
                _buildSubtotalAndCheckout(context, subtotal, storeName, l10n),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStoreHeader(String storeName) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(
        storeName,
        style: const TextStyle(
          fontFamily: 'Lato',
          fontWeight: FontWeight.bold,
          fontSize: 18.0,
        ),
      ),
    );
  }

  Widget _buildCartItemsList(List<CartItem> items) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      itemBuilder: (context, index) {
        return CartItemWidget(item: items[index]);
      },
    );
  }

  Widget _buildSubtotalAndCheckout(BuildContext context, double subtotal, String storeName, AppLocalizations l10n) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          l10n.subtotal(subtotal.toStringAsFixed(2)),
          style: const TextStyle(
            fontFamily: 'Lato',
            fontSize: 16.0,
            fontWeight: FontWeight.bold,
          ),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ShippingAddressScreen(storeSlug: storeName),
              ),
            );
          },
          child: Text(l10n.proceedToCheckout),
        ),
      ],
    );
  }
}

class CartItemWidget extends StatelessWidget {
  final CartItem item;

  const CartItemWidget({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildProductImage(),
          const SizedBox(width: 12.0),
          _buildItemDetails(),
        ],
      ),
    );
  }

  Widget _buildProductImage() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8.0),
      child: Image.network(
        item.product.firstImageUrl,
        width: 80,
        height: 80,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Container(
          width: 80,
          height: 80,
          color: Colors.grey[200],
          child: const Icon(Icons.image_not_supported, color: Colors.grey),
        ),
      ),
    );
  }

  Widget _buildItemDetails() {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            item.product.name,
            style: const TextStyle(
              fontFamily: 'Lato',
              fontWeight: FontWeight.bold,
              fontSize: 16.0,
            ),
          ),
          const SizedBox(height: 4.0),
          Text(
            'Qty: ${item.quantity}',
            style: TextStyle(
              fontFamily: 'Lato',
              fontSize: 14.0,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 4.0),
          Text(
            '\$${item.product.price.toStringAsFixed(2)}',
            style: const TextStyle(
              fontFamily: 'Lato',
              fontSize: 16.0,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
