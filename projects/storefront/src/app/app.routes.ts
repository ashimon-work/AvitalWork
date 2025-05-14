import { Routes } from '@angular/router';
// Import the generated components for direct routing
import { ShopPageComponent } from './shop/shop-page/shop-page.component';
import { AboutPageComponent } from './about/about-page/about-page.component';
import { ContactPageComponent } from './contact/contact-page/contact-page.component';
import { AccountPageComponent } from './account/account-page/account-page.component';
import { CartPageComponent } from './cart/cart-page/cart-page.component';
import { FaqPageComponent } from './faq/faq-page/faq-page.component';
import { ShippingPolicyPageComponent } from './shipping-policy/shipping-policy-page/shipping-policy-page.component';
import { ReturnPolicyPageComponent } from './return-policy/return-policy-page/return-policy-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { NotFoundPageComponent } from './core/components/not-found-page/not-found-page.component';
import { CheckoutPageComponent } from './checkout/checkout-page/checkout-page.component';
import { OrderConfirmationPageComponent } from './order-confirmation/order-confirmation-page/order-confirmation-page.component';
// Import Account section components
import { AccountOverviewComponent } from './account/account-overview/account-overview.component';
import { AccountOrdersComponent } from './account/account-orders/account-orders.component';
import { AccountAddressesComponent } from './account/account-addresses/account-addresses.component';
import { AccountPaymentMethodsComponent } from './account/account-payment-methods/account-payment-methods.component';
import { AccountPersonalInfoComponent } from './account/account-personal-info/account-personal-info.component';
import { AccountWishlistComponent } from './account/account-wishlist/account-wishlist.component';
import { AccountChangePasswordComponent } from './account/account-change-password/account-change-password.component';
import { AccountOrderDetailComponent } from './account/account-order-detail/account-order-detail.component'; // Import Order Detail
// Import Auth Guard
import { authGuard } from './core/guards/auth.guard';
import { storeSlugGuard } from './core/guards/store-slug.guard';

export const routes: Routes = [
  // Redirect root path to a default store or a store selection page (TBD)
  // For now, let's redirect to a default store slug for testing

  // Redirect /default specifically to /awesome-gadgets
  { path: 'default', redirectTo: '/awesome-gadgets', pathMatch: 'full' },
  { path: '', redirectTo: '/default-store', pathMatch: 'full' }, // Redirect root to a default store slug

  // Explicit route for the generic 404 page
  { path: '404', component: NotFoundPageComponent },

  // Parent route to capture the store slug (MUST come AFTER explicit /404)
  {
    path: ':storeSlug',
    // Remove the resolve property
    // resolve: {
    //     isStoreValid: storeSlugResolver
    // },
    canActivate: [storeSlugGuard], // Use the CanActivate guard instead
    children: [
      // Existing routes moved under the :storeSlug parameter
      {
        path: '', // Default path for a store (e.g., /awesome-gadgets)
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'category', // e.g., /awesome-gadgets/category
        loadChildren: () =>
          import('./category/category.module').then((m) => m.CategoryModule),
      },
      {
        path: 'product', // e.g., /awesome-gadgets/product
        loadChildren: () =>
          import('./product/product.module').then((m) => m.ProductModule),
      },
      // Routes for the newly generated standalone components
      {
        path: 'shop', // e.g., /awesome-gadgets/shop
        component: ShopPageComponent
      },
      {
        path: 'about', // e.g., /awesome-gadgets/about
        component: AboutPageComponent
      },
      {
        path: 'contact', // e.g., /awesome-gadgets/contact
        component: ContactPageComponent
      },
      {
        path: 'account', // e.g., /awesome-gadgets/account
        component: AccountPageComponent,
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          { path: 'overview', component: AccountOverviewComponent },
          { path: 'orders', component: AccountOrdersComponent },
          { path: 'orders/:orderId', component: AccountOrderDetailComponent }, // Route for order detail
          { path: 'addresses', component: AccountAddressesComponent },
          { path: 'payment-methods', component: AccountPaymentMethodsComponent },
          { path: 'personal-info', component: AccountPersonalInfoComponent },
          { path: 'wishlist', component: AccountWishlistComponent },
          { path: 'change-password', component: AccountChangePasswordComponent },
        ]
      },
      {
        path: 'checkout', // e.g., /awesome-gadgets/checkout
        component: CheckoutPageComponent
      },
      {
        path: 'order-confirmation', // e.g., /awesome-gadgets/order-confirmation
        component: OrderConfirmationPageComponent
      },
      {
        path: 'cart', // e.g., /awesome-gadgets/cart
        component: CartPageComponent
      },
      // Routes for footer links
      // Footer links - these might need to be store-specific too
      {
        path: 'faq', // e.g., /awesome-gadgets/faq
        component: FaqPageComponent
      },
      {
        path: 'shipping', // e.g., /awesome-gadgets/shipping
        component: ShippingPolicyPageComponent
      },
      {
        path: 'returns', // e.g., /awesome-gadgets/returns
        component: ReturnPolicyPageComponent
      },
      // Auth Routes
      // Auth routes - these are likely global, not store-specific, so keep outside :storeSlug
      // Or maybe they should be under store? TBD. For now, keep them separate.
      // {
      //   path: 'register',
      //   component: RegistrationPageComponent
      // },
      // {
      //   path: 'login',
      //   component: LoginPageComponent
      // },
      // Move Auth Routes inside :storeSlug
      {
        path: 'register', // e.g., /awesome-gadgets/register
        component: RegistrationPageComponent
      },
      {
        path: 'login', // e.g., /awesome-gadgets/login
        component: LoginPageComponent
      },
    ]
  },

  // Wildcard route for 404 page - MUST BE LAST
  { path: '**', component: NotFoundPageComponent }
];
