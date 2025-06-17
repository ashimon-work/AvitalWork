import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// A placeholder for the address model.
// In a real app, this would be in its own file.
class Address {
  final String id;
  final String street;
  final String city;
  final String state;
  final String zipCode;
  final String country;

  Address({
    required this.id,
    required this.street,
    required this.city,
    required this.state,
    required this.zipCode,
    required this.country,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'],
      street: json['street'],
      city: json['city'],
      state: json['state'],
      zipCode: json['zipCode'],
      country: json['country'],
    );
  }
}

class ShippingAddressScreen extends StatefulWidget {
  const ShippingAddressScreen({super.key});

  @override
  State<ShippingAddressScreen> createState() => _ShippingAddressScreenState();
}

class _ShippingAddressScreenState extends State<ShippingAddressScreen> {
  List<Address> _addresses = [];
  bool _isLoading = true;
  String? _error;
  String? _selectedAddressId;

  @override
  void initState() {
    super.initState();
    _fetchAddresses();
  }

  Future<void> _fetchAddresses() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        setState(() {
          _error = 'You are not logged in.';
          _isLoading = false;
        });
        return;
      }

      final response = await http.get(
        Uri.parse('http://localhost:3000/account/addresses'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _addresses = data.map((json) => Address.fromJson(json)).toList();
          if (_addresses.isNotEmpty) {
            _selectedAddressId = _addresses.first.id;
          }
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Failed to load addresses: ${response.statusCode}';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'An error occurred: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shipping Address'),
      ),
      body: _buildBody(),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(8.0),
        child: ElevatedButton(
          onPressed: () {
            // For now, just a placeholder
          },
          child: const Text('Add New Address'),
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(child: Text(_error!));
    }

    if (_addresses.isEmpty) {
      return const Center(child: Text('No saved addresses found.'));
    }

    return ListView.builder(
      itemCount: _addresses.length,
      itemBuilder: (context, index) {
        final address = _addresses[index];
        return RadioListTile<String>(
          title: Text('${address.street}, ${address.city}'),
          subtitle: Text('${address.state}, ${address.zipCode}, ${address.country}'),
          value: address.id,
          groupValue: _selectedAddressId,
          onChanged: (String? value) {
            setState(() {
              _selectedAddressId = value;
            });
          },
        );
      },
    );
  }
}