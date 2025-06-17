import 'package:flutter/material.dart';
import '../services/cart_service.dart';

class ShoppingCartScreen extends StatelessWidget {
  final CartService cartService = CartService();

  ShoppingCartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = cartService.cart;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shopping Cart'),
      ),
      body: cart.isEmpty
          ? const Center(
              child: Text('Your cart is empty.'),
            )
          : ListView.builder(
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
            ),
    );
  }
}