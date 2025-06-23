import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:global_marketplace_app/l10n/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'shipping_method_screen.dart';
import '../widgets/common_app_bar.dart';

class ShippingAddressScreen extends StatefulWidget {
  final String storeSlug;

  const ShippingAddressScreen({super.key, required this.storeSlug});

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
    final l10n = AppLocalizations.of(context)!;
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        setState(() {
          _error = l10n.youAreNotLoggedIn;
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
          _addresses = data.map((json) {
            // The Address class is now imported from shipping_method_screen.dart
            // so we need to adjust the fromJson call if the keys are different.
            // Assuming the keys are 'id', 'street', 'city', 'state', 'postalCode', 'country'
            return Address(
              id: json['id'],
              street: json['street'],
              city: json['city'],
              state: json['state'],
              postalCode: json['zipCode'], // Assuming backend sends 'zipCode'
              country: json['country'],
            );
          }).toList();
          if (_addresses.isNotEmpty) {
            _selectedAddressId = _addresses.first.id;
          }
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = l10n.failedToLoadAddresses(response.statusCode.toString());
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = l10n.anErrorOccurred(e.toString());
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: CommonAppBar(title: l10n.shippingAddress, showBackButton: true),
      body: _buildBody(l10n),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ElevatedButton(
          onPressed: _selectedAddressId != null
              ? () {
                  final selectedAddress = _addresses.firstWhere(
                    (address) => address.id == _selectedAddressId,
                  );
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ShippingMethodScreen(
                        storeSlug: widget.storeSlug,
                        selectedAddress: selectedAddress,
                      ),
                    ),
                  );
                }
              : null,
          child: Text(l10n.continueButton),
        ),
      ),
    );
  }

  Widget _buildBody(AppLocalizations l10n) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(child: Text(_error!));
    }

    if (_addresses.isEmpty) {
      return Center(child: Text(l10n.noSavedAddressesFound));
    }

    return ListView.builder(
      itemCount: _addresses.length,
      itemBuilder: (context, index) {
        final address = _addresses[index];
        return RadioListTile<String>(
          title: Text('${address.street}, ${address.city}'),
          subtitle: Text('${address.state}, ${address.postalCode}, ${address.country}'),
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