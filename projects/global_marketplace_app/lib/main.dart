import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'models/featured_data.dart';
import 'widgets/product_card.dart';

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
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: snapshot.data!.products.length,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 0.75,
                    ),
                    itemBuilder: (context, index) {
                      return ProductCard(product: snapshot.data!.products[index]);
                    },
                  ),
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
