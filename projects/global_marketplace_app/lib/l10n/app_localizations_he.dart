// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hebrew (`he`).
class AppLocalizationsHe extends AppLocalizations {
  AppLocalizationsHe([String locale = 'he']) : super(locale);

  @override
  String get appTitle => 'שוק גלובלי';

  @override
  String get welcome => 'ברוכים הבאים';

  @override
  String get changeLanguage => 'שנה שפה';

  @override
  String get en => 'אנגלית';

  @override
  String get he => 'עברית';

  @override
  String get home => 'בית';

  @override
  String get login => 'התחברות';

  @override
  String get email => 'אימייל';

  @override
  String get password => 'סיסמה';

  @override
  String get loginButton => 'התחבר';

  @override
  String get forgotPassword => 'שכחת סיסמה?';

  @override
  String get createAccount => 'צור חשבון';

  @override
  String get signUp => 'הרשמה';

  @override
  String get profile => 'פרופיל';

  @override
  String get settings => 'הגדרות';

  @override
  String get cart => 'עגלת קניות';

  @override
  String get addToCart => 'הוסף לעגלה';

  @override
  String get products => 'מוצרים';

  @override
  String get productDetails => 'פרטי מוצר';

  @override
  String get price => 'מחיר';

  @override
  String get description => 'תיאור';

  @override
  String get categories => 'קטגוריות';

  @override
  String get search => 'חיפוש';

  @override
  String get searchProducts => 'חפש מוצרים...';

  @override
  String get noProducts => 'לא נמצאו מוצרים';

  @override
  String get checkout => 'תשלום';

  @override
  String get total => 'סה\"כ';

  @override
  String get quantity => 'כמות';

  @override
  String get remove => 'הסר';

  @override
  String get shippingAddress => 'כתובת משלוח';

  @override
  String get paymentMethod => 'אמצעי תשלום';

  @override
  String get placeOrder => 'בצע הזמנה';

  @override
  String get orderConfirmation => 'אישור הזמנה';

  @override
  String get thankYou => 'תודה על ההזמנה!';

  @override
  String get orders => 'הזמנות';

  @override
  String get orderHistory => 'היסטוריית הזמנות';

  @override
  String get stores => 'חנויות';

  @override
  String get storeDetails => 'פרטי חנות';

  @override
  String get featured => 'מומלצים';

  @override
  String get newArrivals => 'הגעות חדשות';

  @override
  String get popularProducts => 'מוצרים פופולריים';

  @override
  String get save => 'שמור';

  @override
  String get cancel => 'בטל';

  @override
  String get ok => 'אישור';

  @override
  String get yes => 'כן';

  @override
  String get no => 'לא';

  @override
  String get retry => 'נסה שוב';

  @override
  String get error => 'שגיאה';

  @override
  String get networkError => 'שגיאת רשת. אנא בדוק את החיבור שלך.';

  @override
  String get generalError => 'משהו השתבש. אנא נסה שוב.';

  @override
  String get loading => 'טוען...';

  @override
  String get noInternetConnection => 'אין חיבור לאינטרנט';

  @override
  String get tryAgain => 'נסה שוב';

  @override
  String get emptyCart => 'עגלת הקניות שלך ריקה';

  @override
  String get continueShopping => 'המשך לקנות';

  @override
  String get logout => 'התנתק';

  @override
  String get confirmLogout => 'האם אתה בטוח שברצונך להתנתק?';

  @override
  String get paymentScreenTitle => 'תשלום';

  @override
  String get addNewPaymentMethod => 'הוסף אמצעי תשלום חדש';

  @override
  String get orderConfirmed => 'ההזמנה אושרה';

  @override
  String get orderPlacedSuccessfully => 'ההזמנה בוצעה בהצלחה!';

  @override
  String errorPlacingOrder(Object error) {
    return 'שגיאה בביצוע ההזמנה: $error';
  }

  @override
  String anErrorOccurred(Object error) {
    return 'אירעה שגיאה: $error';
  }

  @override
  String paymentMethodDisplay(Object brand, Object last4) {
    return '$brand המסתיים ב-$last4';
  }

  @override
  String get storePageTitle => 'עמוד חנות';

  @override
  String errorLoading(Object error) {
    return 'שגיאה: $error';
  }

  @override
  String get storeNotFound => 'החנות לא נמצאה';

  @override
  String get featuredProducts => 'מוצרים מומלצים';

  @override
  String get allProducts => 'כל המוצרים';

  @override
  String get noCategoriesAvailable => 'אין קטגוריות זמינות';

  @override
  String get noProductsAvailable => 'אין מוצרים זמינים';

  @override
  String get noStoresAvailable => 'אין חנויות זמינות';

  @override
  String get all => 'הכל';

  @override
  String get product => 'מוצר';

  @override
  String get noProductDataFound => 'לא נמצאו נתוני מוצר.';

  @override
  String get noDescriptionAvailable => 'אין תיאור זמין.';

  @override
  String get productAddedToCart => 'המוצר נוסף לעגלה!';

  @override
  String get pleaseLogInToAdd => 'אנא התחבר כדי להוסיף פריטים לעגלה';

  @override
  String get shoppingCart => 'עגלת קניות';

  @override
  String failedToLoadCart(Object error) {
    return 'נכשל בטעינת העגלה: $error';
  }

  @override
  String get yourCartIsEmpty => 'העגלה שלך ריקה.';

  @override
  String subtotal(Object subtotal) {
    return 'סכום ביניים: \$$subtotal';
  }

  @override
  String get proceedToCheckout => 'המשך לתשלום';

  @override
  String get continueButton => 'המשך';

  @override
  String get noSavedAddressesFound => 'לא נמצאו כתובות שמורות.';

  @override
  String get youAreNotLoggedIn => 'אינך מחובר.';

  @override
  String failedToLoadAddresses(Object statusCode) {
    return 'נכשל בטעינת הכתובות: $statusCode';
  }

  @override
  String get continueToPayment => 'המשך לתשלום';

  @override
  String get addPaymentMethod => 'הוסף אמצעי תשלום';

  @override
  String get failedToAddPaymentMethod => 'נכשל בהוספת אמצעי התשלום.';

  @override
  String get shippingMethod => 'שיטת משלוח';
}
