import 'package:flutter/material.dart';
import 'package:global_marketplace_app/l10n/app_localizations.dart';
import 'package:global_marketplace_app/models/store_data.dart';
import 'package:global_marketplace_app/services/api_service.dart';
import 'package:global_marketplace_app/widgets/product_grid.dart';
import 'package:global_marketplace_app/widgets/common_app_bar.dart';

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
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
             appBar: CommonAppBar(title: l10n.storePageTitle, showBackButton: true),
      body: FutureBuilder<StoreData>(
        future: _storeDataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text(l10n.errorLoading(snapshot.error.toString())));
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
                    l10n.featuredProducts,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  ProductGrid(products: storeData.featuredProducts),
                  const SizedBox(height: 24),
                  Text(
                    l10n.allProducts,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  ProductGrid(products: storeData.products),
                ],
              ),
            );
          } else {
            return Center(child: Text(l10n.storeNotFound));
          }
        },
      ),
    );
  }
}