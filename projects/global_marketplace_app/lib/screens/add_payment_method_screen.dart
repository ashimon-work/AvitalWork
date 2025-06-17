import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class AddPaymentMethodScreen extends StatefulWidget {
  final String storeSlug;

  const AddPaymentMethodScreen({super.key, required this.storeSlug});

  @override
  AddPaymentMethodScreenState createState() => AddPaymentMethodScreenState();
}

class AddPaymentMethodScreenState extends State<AddPaymentMethodScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeWebView();
  }

  Future<void> _initializeWebView() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final userId = await authService.getUserId(); // Assuming you have a method to get the user ID

    final iframeUrl = 'https://direct.tranzila.com/YOUR_TERMINAL/iframenew.php?'
        'sum=1&' // Tokenization usually requires a small amount
        'cy=1&' // Currency code (1 for ILS)
        'tranmode=K&' // Use 'K' for tokenization
        'success_url_address=https://smartyapp.co.il/api/tranzila/success&'
        'fail_url_address=https://smartyapp.co.il/api/tranzila/failure&'
        'notify_url_address=https://smartyapp.co.il/api/tranzila/notify&'
        'custom_user_id=$userId';

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
            if (url.contains('success')) {
              Navigator.of(context).pop(true); // Pop with a success result
            } else if (url.contains('failure')) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Failed to add payment method.')),
              );
              Navigator.of(context).pop(false);
            }
          },
          onWebResourceError: (WebResourceError error) {
             ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Error: ${error.description}')),
              );
             Navigator.of(context).pop(false);
          },
        ),
      )
      ..loadRequest(Uri.parse(iframeUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Payment Method')),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}