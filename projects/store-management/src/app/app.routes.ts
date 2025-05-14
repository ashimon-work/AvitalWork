import { Routes } from '@angular/router';
import { CheckStoreSlugGuard } from './core/guards/check-store-slug.guard';
import { ManagementAuthGuard } from './core/guards/management-auth.guard';
import { ProductService } from './product/product.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'default-store/dashboard', // Temporary redirect, will be caught by AuthGuard if not logged in
    pathMatch: 'full'
  },
  // Login route is now under :storeSlug
  {
    path: ':storeSlug',
    canActivate: [CheckStoreSlugGuard], // Ensures storeSlug is valid before proceeding
    children: [
      {
        path: 'login', // Login page specific to the store
        loadComponent: () => import('./auth/login-page/login-page.component').then(m => m.LoginPageComponent)
        // This route is NOT protected by ManagementAuthGuard
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
        canActivate: [ManagementAuthGuard]
      },
      {
        path: 'products',
        loadComponent: () => import('./product-management/product-management-page/product-management-page.component').then(m => m.ProductManagementPageComponent),
        providers: [ProductService],
        canActivate: [ManagementAuthGuard]
      },
      {
        path: 'orders',
        loadComponent: () => import('./order-management/order-management-page/order-management-page.component').then(m => m.OrderManagementPageComponent),
        canActivate: [ManagementAuthGuard]
      },
      {
        path: 'customers',
        loadComponent: () => import('./customer-management/customer-management-page/customer-management-page.component').then(m => m.CustomerManagementPageComponent),
        canActivate: [ManagementAuthGuard]
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings-page/settings-page.component').then(m => m.SettingsPageComponent),
        canActivate: [ManagementAuthGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
        canActivate: [ManagementAuthGuard]
      },
      {
        path: '**', // Wildcard route for 404 within the :storeSlug context
        loadComponent: () => import('./core/components/management-not-found-page/management-not-found-page.component').then(m => m.ManagementNotFoundPageComponent),
        canActivate: [ManagementAuthGuard]
      }
    ]
  },
  // Consider a global 404 route if :storeSlug is invalid and CheckStoreSlugGuard doesn't redirect,
  // or if the initial redirect target itself is problematic.
  // For now, this structure should handle most cases.
];
