import 'package:flutter/material.dart';
import '../services/cart_service.dart';

class ShoppingCartScreen extends StatefulWidget {
  const ShoppingCartScreen({super.key});

  @override
  State<ShoppingCartScreen> createState() => _ShoppingCartScreenState();
}

class _ShoppingCartScreenState extends State<ShoppingCartScreen> {
  final CartService cartService = CartService();
  late Future<void> _fetchCartsFuture;

  @override
  void initState() {
    super.initState();
    _fetchCartsFuture = cartService.fetchUserCarts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shopping Cart'),
      ),
      body: FutureBuilder<void>(
        future: _fetchCartsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          } else if (snapshot.hasError) {
            return const Center(
              child: Text('Failed to load cart. Please try again later.'),
            );
          } else {
            final cart = cartService.carts;
            if (cart.isEmpty) {
              return const Center(
                child: Text('Your cart is empty.'),
              );
            }
            return ListView.builder(
              itemCount: cart.keys.length,
              itemBuilder: (context, index) {
                final storeName = cart.keys.elementAt(index);
                final products = cart[storeName]!;
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Text(
                        storeName,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: products.length,
                      itemBuilder: (context, productIndex) {
                        final product = products[productIndex];
                        return ListTile(
                          title: Text(product.name),
                        );
                      },
                    ),
                  ],
                );
              },
            );
          }
        },
      ),
    );
  }
}
