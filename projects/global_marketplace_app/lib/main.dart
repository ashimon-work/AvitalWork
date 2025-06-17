import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Global Marketplace',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<FeaturedData> futureFeaturedData;

  @override
  void initState() {
    super.initState();
    futureFeaturedData = fetchFeaturedData();
  }

  Future<FeaturedData> fetchFeaturedData() async {
    final response = await http.get(Uri.parse('https://smartyapp.co.il/api/marketplace/home'));

    if (response.statusCode == 200) {
      return FeaturedData.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load featured data');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Global Marketplace'),
      ),
      body: Center(
        child: FutureBuilder<FeaturedData>(
          future: futureFeaturedData,
          builder: (context, snapshot) {
            if (snapshot.hasData) {
              return ListView(
                padding: const EdgeInsets.all(16.0),
                children: [
                  const Text('Featured Stores', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  ...snapshot.data!.stores.map((store) => Text(store.name)),
                  const SizedBox(height: 20),
                  const Text('Featured Categories', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  ...snapshot.data!.categories.map((category) => Text(category.name)),
                  const SizedBox(height: 20),
                  const Text('Featured Products', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  ...snapshot.data!.products.map((product) => Text(product.name)),
                ],
              );
            } else if (snapshot.hasError) {
              return Text('${snapshot.error}');
            }
            return const CircularProgressIndicator();
          },
        ),
      ),
    );
  }
}

class FeaturedData {
  final List<Product> products;
  final List<Category> categories;
  final List<Store> stores;

  FeaturedData({required this.products, required this.categories, required this.stores});

  factory FeaturedData.fromJson(Map<String, dynamic> json) {
    return FeaturedData(
      products: (json['featuredProducts'] as List).map((i) => Product.fromJson(i)).toList(),
      categories: (json['featuredCategories'] as List).map((i) => Category.fromJson(i)).toList(),
      stores: (json['featuredStores'] as List).map((i) => Store.fromJson(i)).toList(),
    );
  }
}

class Product {
  final String name;

  Product({required this.name});

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      name: json['name'],
    );
  }
}

class Category {
  final String name;

  Category({required this.name});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      name: json['name'],
    );
  }
}

class Store {
  final String name;

  Store({required this.name});

  factory Store.fromJson(Map<String, dynamic> json) {
    return Store(
      name: json['name'],
    );
  }
}
