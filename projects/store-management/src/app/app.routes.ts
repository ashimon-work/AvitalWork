import { Routes } from '@angular/router';
import { CheckStoreSlugGuard } from './core/guards/check-store-slug.guard';
import { ProductService } from './product/product.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'default-store/dashboard', // Temporary redirect to a default store slug
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login-page/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: ':storeSlug',
    canActivate: [CheckStoreSlugGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./product-management/product-management-page/product-management-page.component').then(m => m.ProductManagementPageComponent),
        providers: [ProductService]
      },
      {
        path: 'orders',
        loadComponent: () => import('./order-management/order-management-page/order-management-page.component').then(m => m.OrderManagementPageComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./customer-management/customer-management-page/customer-management-page.component').then(m => m.CustomerManagementPageComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings-page/settings-page.component').then(m => m.SettingsPageComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile-page/profile-page.component').then(m => m.ProfilePageComponent)
      },
      {
        path: '**', // Wildcard route for 404
        loadComponent: () => import('./core/components/management-not-found-page/management-not-found-page.component').then(m => m.ManagementNotFoundPageComponent)
      }
    ]
  }
];
