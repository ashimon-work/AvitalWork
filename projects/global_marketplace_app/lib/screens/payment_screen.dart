import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:global_marketplace_app/l10n/app_localizations.dart';
import 'package:global_marketplace_app/screens/shipping_method_screen.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../providers/providers.dart';
import 'add_payment_method_screen.dart';

class PaymentMethodEntity {
  final String id;
  final String brand;
  final String last4;

  PaymentMethodEntity({required this.id, required this.brand, required this.last4});

  factory PaymentMethodEntity.fromJson(Map<String, dynamic> json) {
    return PaymentMethodEntity(
      id: json['id'],
      brand: json['brand'],
      last4: json['last4'],
    );
  }
}

class PaymentScreen extends StatefulWidget {
  final String storeSlug;
  final Address selectedAddress;
  final ShippingMethod selectedShippingMethod;

  const PaymentScreen({
    super.key,
    required this.storeSlug,
    required this.selectedAddress,
    required this.selectedShippingMethod,
  });

  @override
  PaymentScreenState createState() => PaymentScreenState();
}

class PaymentScreenState extends State<PaymentScreen> {
  List<PaymentMethodEntity> _paymentMethods = [];
  PaymentMethodEntity? _selectedPaymentMethod;
  bool _isLoading = true;
  bool _isPlacingOrder = false;

  @override
  void initState() {
    super.initState();
    _fetchPaymentMethods();
  }

  Future<void> _fetchPaymentMethods() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.userToken;
    if (token == null) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('http://localhost:3000/account/payment-methods'),
        headers: {
          'Authorization': 'Bearer $token',
          'x-store-slug': widget.storeSlug,
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> responseData = json.decode(response.body);
        setState(() {
          _paymentMethods = responseData.map((data) => PaymentMethodEntity.fromJson(data)).toList();
          if (_paymentMethods.isNotEmpty) {
            _selectedPaymentMethod = _paymentMethods.first;
          }
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _placeOrder() async {
    if (_selectedPaymentMethod == null) return;

    setState(() => _isPlacingOrder = true);

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    final token = authProvider.userToken;
    
    final cartItems = cartProvider.getCartItemsForStore(widget.storeSlug);
    final items = cartItems.map((item) => {'productId': item.product.id, 'quantity': item.quantity}).toList();

    try {
      final response = await http.post(
        Uri.parse('http://localhost:3000/orders'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
           'x-store-slug': widget.storeSlug,
        },
        body: json.encode({
          'shippingAddressId': widget.selectedAddress.id,
          'shippingMethodId': widget.selectedShippingMethod.id,
          'paymentMethodId': _selectedPaymentMethod!.id,
          'items': items,
        }),
      );

      if (response.statusCode == 201) {
        cartProvider.clearCartForStore(widget.storeSlug);
        if(mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const OrderConfirmationScreen()),
            (Route<dynamic> route) => false,
          );
        }
      } else {
        if(mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(AppLocalizations.of(context)!.errorPlacingOrder(response.body))),
          );
        }
      }
    } catch (e) {
      if(mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(AppLocalizations.of(context)!.anErrorOccurred(e.toString()))),
        );
      }
    } finally {
      if(mounted) {
        setState(() => _isPlacingOrder = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.paymentMethod),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: _paymentMethods.length,
                    itemBuilder: (context, index) {
                      final method = _paymentMethods[index];
                      return RadioListTile<PaymentMethodEntity>(
                        title: Text(l10n.paymentMethodDisplay(method.brand, method.last4)),
                        value: method,
                        groupValue: _selectedPaymentMethod,
                        onChanged: (PaymentMethodEntity? value) {
                          setState(() {
                            _selectedPaymentMethod = value;
                          });
                        },
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      if (_isPlacingOrder)
                        const CircularProgressIndicator()
                      else
                        ElevatedButton(
                          onPressed: _selectedPaymentMethod != null ? _placeOrder : null,
                          child: Text(l10n.placeOrder),
                        ),
                      TextButton(
                        onPressed: () async {
                          final result = await Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => AddPaymentMethodScreen(storeSlug: widget.storeSlug),
                            ),
                          );
                          if (result == true) {
                            _fetchPaymentMethods();
                          }
                        },
                        child: Text(l10n.addNewPaymentMethod),
                      )
                    ],
                  )
                ),
              ],
            ),
    );
  }
}

class OrderConfirmationScreen extends StatelessWidget {
  const OrderConfirmationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.orderConfirmed),
      ),
      body: Center(
        child: Text(l10n.orderPlacedSuccessfully),
      ),
    );
  }
}