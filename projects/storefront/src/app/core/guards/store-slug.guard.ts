import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router'; // Use CanActivateFn, UrlTree
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

// Renamed function and updated signature for CanActivateFn
export const storeSlugGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
): Observable<boolean | UrlTree> => { // Return type includes UrlTree
  console.log('[StoreSlugGuard] Checking activation...');
  const slug = route.paramMap.get('storeSlug');
  const apiService = inject(ApiService);
  const router = inject(Router);

  // Removed explicit '404' check - the explicit route in app.routes.ts handles this.

  if (!slug) {
    console.error('[StoreSlugGuard] No store slug found in route parameters. Redirecting to /404.'); // Updated log prefix
    // Return Observable emitting the UrlTree for redirection
    return of(router.parseUrl('/404'));
  }

  console.log(`[StoreSlugGuard] Found slug "${slug}". Skipping API validation for now.`); // Updated log prefix
  // Temporarily skip validation to allow pages to load without seeded data
  return of(true);
};