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
// Import Account section components
import { AccountOverviewComponent } from './account/account-overview/account-overview.component';
import { AccountOrdersComponent } from './account/account-orders/account-orders.component';
import { AccountAddressesComponent } from './account/account-addresses/account-addresses.component';
import { AccountPaymentMethodsComponent } from './account/account-payment-methods/account-payment-methods.component';
import { AccountPersonalInfoComponent } from './account/account-personal-info/account-personal-info.component';
import { AccountWishlistComponent } from './account/account-wishlist/account-wishlist.component';
import { AccountChangePasswordComponent } from './account/account-change-password/account-change-password.component';
// Import Auth Guard
import { authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'category',
    loadChildren: () =>
      import('./category/category.module').then((m) => m.CategoryModule),
  },
  {
    path: 'product', // Route for product pages
    loadChildren: () =>
      import('./product/product.module').then((m) => m.ProductModule), // Lazy load ProductModule
  },
  // Routes for the newly generated standalone components
  {
    path: 'shop',
    component: ShopPageComponent // Direct route to standalone component
    // Or lazy load: loadComponent: () => import('./shop/shop-page/shop-page.component').then(m => m.ShopPageComponent)
  },
  {
    path: 'about',
    component: AboutPageComponent
    // loadComponent: () => import('./about/about-page/about-page.component').then(m => m.AboutPageComponent)
  },
  {
    path: 'contact',
    component: ContactPageComponent
    // loadComponent: () => import('./contact/contact-page/contact-page.component').then(m => m.ContactPageComponent)
  },
  {
    path: 'account',
    component: AccountPageComponent,
    canActivate: [authGuard], // Apply the guard to the parent route
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' }, // Default redirect
      { path: 'overview', component: AccountOverviewComponent },
      { path: 'orders', component: AccountOrdersComponent },
      { path: 'addresses', component: AccountAddressesComponent },
      { path: 'payment-methods', component: AccountPaymentMethodsComponent },
      { path: 'personal-info', component: AccountPersonalInfoComponent },
      { path: 'wishlist', component: AccountWishlistComponent },
      { path: 'change-password', component: AccountChangePasswordComponent },
      // Add routes for specific order details etc. later if needed
      // { path: 'orders/:id', component: OrderDetailsComponent },
    ]
  },
  {
    path: 'cart',
    component: CartPageComponent
    // loadComponent: () => import('./cart/cart-page/cart-page.component').then(m => m.CartPageComponent)
  },
  // Routes for footer links
  {
    path: 'faq',
    component: FaqPageComponent
  },
  {
    path: 'shipping', // Or 'shipping-policy'
    component: ShippingPolicyPageComponent
  },
  {
    path: 'returns', // Or 'return-policy'
    component: ReturnPolicyPageComponent
  },
  // Auth Routes
  {
    path: 'register',
    component: RegistrationPageComponent
  },
  {
    path: 'login',
    component: LoginPageComponent // Add route for Login Page
  },
  // Consider adding a wildcard route for 404 page at the end
  // { path: '**', component: NotFoundPageComponent }
];
