import 'package:flutter/material.dart';
import 'package:global_marketplace_app/models/home_data.dart';
import 'package:global_marketplace_app/services/api_service.dart';
import 'package:global_marketplace_app/widgets/product_card.dart';
import 'package:global_marketplace_app/models/product.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  HomeScreenState createState() => HomeScreenState();
}

class HomeScreenState extends State<HomeScreen> {
  late Future<HomeData> _homeDataFuture;

  @override
  void initState() {
    super.initState();
    _homeDataFuture = ApiService().fetchHomeData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Global Marketplace'),
      ),
      body: FutureBuilder<HomeData>(
        future: _homeDataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (snapshot.hasData) {
            final products = snapshot.data!.featuredProducts.map((p) {
              return Product(
                id: p.id,
                sku: p.sku,
                name: p.name,
                description: p.description,
                price: p.price,
                imageUrls: p.imageUrls,
                categories: p.categories,
                tags: p.tags,
                stockLevel: p.stockLevel,
                isActive: true,
                isFeaturedInMarketplace: true,
                store: p.store,
              );
            }).toList();

            return GridView.builder(
              padding: const EdgeInsets.all(16.0),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16.0,
                mainAxisSpacing: 16.0,
                childAspectRatio: 0.75,
              ),
              itemCount: products.length,
              itemBuilder: (context, index) {
                return ProductCard(product: products[index]);
              },
            );
          } else {
            return const Center(child: Text('No data available'));
          }
        },
      ),
    );
  }
}
