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

  console.log(`[StoreSlugGuard] Found slug "${slug}". Calling API to validate...`); // Updated log prefix
  return apiService.checkStoreSlug(slug).pipe(
    take(1), // Ensure the observable completes
    // Use map to decide whether to proceed or navigate away
    map(isValid => {
      if (isValid) {
        console.log(`[StoreSlugGuard] API validation successful for slug "${slug}". Allowing activation.`); // Updated log prefix
        return true; // Allow activation
      } else {
        console.warn(`[StoreSlugGuard] API validation failed for slug "${slug}". Redirecting to /404.`); // Updated log prefix
        // Return the UrlTree directly from map for redirection
        return router.parseUrl('/404');
      }
    }),
    catchError(error => {
      console.error(`[StoreSlugGuard] API error validating slug "${slug}". Redirecting to /404.`, error); // Updated log prefix
      // Return Observable emitting the UrlTree for redirection
      return of(router.parseUrl('/404'));
    })
  );
};