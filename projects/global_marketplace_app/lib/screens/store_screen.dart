import 'package:flutter/material.dart';
import 'package:global_marketplace_app/models/store_data.dart';
import 'package:global_marketplace_app/services/api_service.dart';
import 'package:global_marketplace_app/widgets/product_grid.dart';

class StoreScreen extends StatefulWidget {
  final String storeSlug;

  const StoreScreen({super.key, required this.storeSlug});

  @override
  StoreScreenState createState() => StoreScreenState();
}

class StoreScreenState extends State<StoreScreen> {
  late Future<StoreData> _storeDataFuture;

  @override
  void initState() {
    super.initState();
    _storeDataFuture = ApiService().fetchStoreData(widget.storeSlug);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Store Page'),
      ),
      body: FutureBuilder<StoreData>(
        future: _storeDataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (snapshot.hasData) {
            final storeData = snapshot.data!;
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    storeData.store.name,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    storeData.store.description ?? '',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Featured Products',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  ProductGrid(products: storeData.featuredProducts),
                  const SizedBox(height: 24),
                  Text(
                    'All Products',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  ProductGrid(products: storeData.products),
                ],
              ),
            );
          } else {
            return const Center(child: Text('Store not found'));
          }
        },
      ),
    );
  }
}