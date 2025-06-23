// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Global Marketplace';

  @override
  String get welcome => 'Welcome';

  @override
  String get changeLanguage => 'Change Language';

  @override
  String get en => 'English';

  @override
  String get he => 'Hebrew';

  @override
  String get home => 'Home';

  @override
  String get login => 'Login';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get loginButton => 'Log In';

  @override
  String get forgotPassword => 'Forgot Password?';

  @override
  String get createAccount => 'Create Account';

  @override
  String get signUp => 'Sign Up';

  @override
  String get profile => 'Profile';

  @override
  String get settings => 'Settings';

  @override
  String get cart => 'Cart';

  @override
  String get addToCart => 'Add to Cart';

  @override
  String get products => 'Products';

  @override
  String get productDetails => 'Product Details';

  @override
  String get price => 'Price';

  @override
  String get description => 'Description';

  @override
  String get categories => 'Categories';

  @override
  String get search => 'Search';

  @override
  String get searchProducts => 'Search products...';

  @override
  String get noProducts => 'No products found';

  @override
  String get checkout => 'Checkout';

  @override
  String get total => 'Total';

  @override
  String get quantity => 'Quantity';

  @override
  String get remove => 'Remove';

  @override
  String get shippingAddress => 'Shipping Address';

  @override
  String get paymentMethod => 'Payment Method';

  @override
  String get placeOrder => 'Place Order';

  @override
  String get orderConfirmation => 'Order Confirmation';

  @override
  String get thankYou => 'Thank you for your order!';

  @override
  String get orders => 'Orders';

  @override
  String get orderHistory => 'Order History';

  @override
  String get stores => 'Stores';

  @override
  String get storeDetails => 'Store Details';

  @override
  String get featured => 'Featured';

  @override
  String get newArrivals => 'New Arrivals';

  @override
  String get popularProducts => 'Popular Products';

  @override
  String get save => 'Save';

  @override
  String get cancel => 'Cancel';

  @override
  String get ok => 'OK';

  @override
  String get yes => 'Yes';

  @override
  String get no => 'No';

  @override
  String get retry => 'Retry';

  @override
  String get error => 'Error';

  @override
  String get networkError => 'Network error. Please check your connection.';

  @override
  String get generalError => 'Something went wrong. Please try again.';

  @override
  String get loading => 'Loading...';

  @override
  String get noInternetConnection => 'No internet connection';

  @override
  String get tryAgain => 'Try Again';

  @override
  String get emptyCart => 'Your cart is empty';

  @override
  String get continueShopping => 'Continue Shopping';

  @override
  String get logout => 'Logout';

  @override
  String get confirmLogout => 'Are you sure you want to logout?';

  @override
  String get paymentScreenTitle => 'Payment';

  @override
  String get addNewPaymentMethod => 'Add New Payment Method';

  @override
  String get orderConfirmed => 'Order Confirmed';

  @override
  String get orderPlacedSuccessfully => 'Order Placed Successfully!';

  @override
  String errorPlacingOrder(Object error) {
    return 'Error placing order: $error';
  }

  @override
  String anErrorOccurred(Object error) {
    return 'An error occurred: $error';
  }

  @override
  String paymentMethodDisplay(Object brand, Object last4) {
    return '$brand ending in $last4';
  }

  @override
  String get storePageTitle => 'Store Page';

  @override
  String errorLoading(Object error) {
    return 'Error: $error';
  }

  @override
  String get storeNotFound => 'Store not found';

  @override
  String get featuredProducts => 'Featured Products';

  @override
  String get allProducts => 'All Products';

  @override
  String get noCategoriesAvailable => 'No categories available';

  @override
  String get noProductsAvailable => 'No products available';

  @override
  String get noStoresAvailable => 'No stores available';

  @override
  String get all => 'All';

  @override
  String get product => 'Product';

  @override
  String get noProductDataFound => 'No product data found.';

  @override
  String get noDescriptionAvailable => 'No description available.';

  @override
  String get productAddedToCart => 'Product added to cart!';

  @override
  String get pleaseLogInToAdd => 'Please log in to add items to your cart';

  @override
  String get shoppingCart => 'Shopping Cart';

  @override
  String failedToLoadCart(Object error) {
    return 'Failed to load cart: $error';
  }

  @override
  String get yourCartIsEmpty => 'Your Cart is Empty.';

  @override
  String subtotal(Object subtotal) {
    return 'Subtotal: \$$subtotal';
  }

  @override
  String get proceedToCheckout => 'Proceed to Checkout';

  @override
  String get continueButton => 'Continue';

  @override
  String get noSavedAddressesFound => 'No saved addresses found.';

  @override
  String get youAreNotLoggedIn => 'You are not logged in.';

  @override
  String failedToLoadAddresses(Object statusCode) {
    return 'Failed to load addresses: $statusCode';
  }

  @override
  String get continueToPayment => 'Continue to Payment';

  @override
  String get addPaymentMethod => 'Add Payment Method';

  @override
  String get failedToAddPaymentMethod => 'Failed to add payment method.';

  @override
  String get shippingMethod => 'Shipping Method';
}
