import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/product.dart';
import '../services/cart_service.dart';

// As per style guide
const Color primaryColor = Color(0xFF0A4F70);
const Color accentColor = Color(0xFFFFC107);
const String fontName = 'Lato';

class ProductDetailScreen extends StatefulWidget {
  final String productId;
  final String storeSlug;

  const ProductDetailScreen({
    super.key,
    required this.productId,
    required this.storeSlug,
  });

  @override
  ProductDetailScreenState createState() => ProductDetailScreenState();
}

class ProductDetailScreenState extends State<ProductDetailScreen> {
  late Future<Map<String, dynamic>> _productFuture;
  final CartService _cartService = CartService();
  final ValueNotifier<int> _currentPageNotifier = ValueNotifier<int>(0);

  @override
  void initState() {
    super.initState();
    _productFuture = _fetchProductDetails();
  }

  @override
  void dispose() {
    _currentPageNotifier.dispose();
    super.dispose();
  }

  Future<Map<String, dynamic>> _fetchProductDetails() async {
    final url = Uri.parse(
        'https://smartyapp.co.il/api/stores/${widget.storeSlug}/products/${widget.productId}');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        // The API returns the product data directly
        return json.decode(response.body);
      } else {
        throw Exception(
            'Failed to load product details (Status code: ${response.statusCode})');
      }
    } catch (e) {
      throw Exception('Failed to fetch product details: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: primaryColor,
        elevation: 0, // A subtle detail for a flatter design
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Product', // Or can be empty as per design doc implication
          style: TextStyle(
            fontFamily: fontName,
            color: Colors.white,
          ),
        ),
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _productFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: primaryColor));
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (snapshot.hasData) {
            final product = snapshot.data!;
            final imageUrls = (product['imageUrls'] as List).isNotEmpty
                ? List<String>.from(product['imageUrls'])
                : ['https://via.placeholder.com/400x300.png?text=No+Image'];

            return SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildImageCarousel(imageUrls),
                  Padding(
                    padding: const EdgeInsets.all(24.0), // Generous padding
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildStoreAttribution(product['store']),
                        const SizedBox(height: 12),
                        Text(
                          product['name'] ?? 'No name',
                          style: const TextStyle(
                            fontFamily: fontName,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '\$${product['price']?.toStringAsFixed(2) ?? 'N/A'}',
                          style: const TextStyle(
                            fontFamily: fontName,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: accentColor,
                          ),
                        ),
                        const SizedBox(height: 24),
                        _buildAddToCartButton(product),
                        const SizedBox(height: 24),
                        const Text(
                          'Description',
                           style: TextStyle(
                            fontFamily: fontName,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                           ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          product['description'] ?? 'No description available.',
                          style: const TextStyle(
                            fontFamily: fontName,
                            fontSize: 16,
                            height: 1.5, // Improves readability
                            color: Colors.black54,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          } else {
            return const Center(child: Text('No product data found.'));
          }
        },
      ),
    );
  }

  Widget _buildImageCarousel(List<String> imageUrls) {
    return Column(
      children: [
        SizedBox(
          height: 300,
          child: PageView.builder(
            itemCount: imageUrls.length,
            onPageChanged: (index) {
              _currentPageNotifier.value = index;
            },
            itemBuilder: (context, index) {
              return Image.network(
                imageUrls[index],
                fit: BoxFit.cover,
                // Loading builder for a better UX
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return const Center(child: CircularProgressIndicator(color: primaryColor));
                },
                errorBuilder: (context, error, stackTrace) {
                  return const Icon(Icons.error, color: Colors.red, size: 48);
                },
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        ValueListenableBuilder<int>(
          valueListenable: _currentPageNotifier,
          builder: (context, value, child) {
            return Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(imageUrls.length, (index) {
                return Container(
                  width: 8.0,
                  height: 8.0,
                  margin: const EdgeInsets.symmetric(horizontal: 4.0),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: value == index
                        ? primaryColor
                        : Colors.grey.withOpacity(0.5),
                  ),
                );
              }),
            );
          },
        ),
      ],
    );
  }

  Widget _buildStoreAttribution(Map<String, dynamic>? store) {
    if (store == null) {
      return const SizedBox.shrink();
    }
    return Row(
      children: [
        CircleAvatar(
          radius: 16,
          backgroundImage: store['logoUrl'] != null
              ? NetworkImage(store['logoUrl'])
              : null,
          child: store['logoUrl'] == null
              ? const Icon(Icons.store, size: 16)
              : null,
        ),
        const SizedBox(width: 8),
        Text(
          store['name'] ?? 'Store',
          style: const TextStyle(
            fontFamily: fontName,
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: Colors.black54,
          ),
        ),
      ],
    );
  }

  Widget _buildAddToCartButton(Map<String, dynamic> productData) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12), // Per style guide
          ),
        ),
        onPressed: () {
          final product = Product.fromJson(productData);
          _cartService.addToCart(widget.storeSlug, product, 1);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Product added to cart!', style: TextStyle(fontFamily: fontName)),
              duration: Duration(seconds: 2),
              backgroundColor: accentColor,
            ),
          );
        },
        child: const Text(
          'Add to Cart',
          style: TextStyle(
            fontFamily: fontName,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
