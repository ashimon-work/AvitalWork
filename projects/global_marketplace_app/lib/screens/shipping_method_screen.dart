import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';
import 'package:provider/provider.dart';

// A placeholder for the Address model.
// You should replace this with your actual Address model.
class Address {
  final String id;
  final String street;
  final String city;
  final String state;
  final String postalCode;
  final String country;

  Address({
    required this.id,
    required this.street,
    required this.city,
    required this.state,
    required this.postalCode,
    required this.country,
  });
}

class ShippingMethod {
  final String id;
  final String name;
  final double cost;

  ShippingMethod({required this.id, required this.name, required this.cost});

  factory ShippingMethod.fromJson(Map<String, dynamic> json) {
    return ShippingMethod(
      id: json['id'],
      name: json['name'],
      cost: (json['cost'] as num).toDouble(),
    );
  }
}

class ShippingMethodScreen extends StatefulWidget {
  final String storeSlug;
  final Address selectedAddress;

  const ShippingMethodScreen({
    super.key,
    required this.storeSlug,
    required this.selectedAddress,
  });

  @override
  ShippingMethodScreenState createState() => ShippingMethodScreenState();
}

class ShippingMethodScreenState extends State<ShippingMethodScreen> {
  List<ShippingMethod> _shippingMethods = [];
  ShippingMethod? _selectedMethod;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchShippingMethods();
  }

  Future<void> _fetchShippingMethods() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final token = await authService.getToken();

    if (token == null) {
      // Handle missing token
      setState(() {
        _isLoading = false;
      });
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('https://smartyapp.co.il/api/stores/${widget.storeSlug}/shipping/methods'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> responseData = json.decode(response.body);
        setState(() {
          _shippingMethods = responseData.map((data) => ShippingMethod.fromJson(data)).toList();
          if (_shippingMethods.isNotEmpty) {
            _selectedMethod = _shippingMethods.first;
          }
          _isLoading = false;
        });
      } else {
        // Handle error
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      // Handle exception
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shipping Method'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: _shippingMethods.length,
                    itemBuilder: (context, index) {
                      final method = _shippingMethods[index];
                      return RadioListTile<ShippingMethod>(
                        title: Text(method.name),
                        subtitle: Text('\$${method.cost.toStringAsFixed(2)}'),
                        value: method,
                        groupValue: _selectedMethod,
                        onChanged: (ShippingMethod? value) {
                          setState(() {
                            _selectedMethod = value;
                          });
                        },
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: ElevatedButton(
                    onPressed: _selectedMethod != null
                        ? () {
                            // TODO: Navigate to Payment Screen
                          }
                        : null,
                    child: const Text('Continue to Payment'),
                  ),
                ),
              ],
            ),
    );
  }
}