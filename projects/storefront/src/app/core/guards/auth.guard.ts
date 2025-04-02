import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Import AuthService
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use the isAuthenticated$ observable from AuthService
  return authService.isAuthenticated$.pipe(
    take(1), // Take the current value and complete
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true; // Allow access if authenticated
      } else {
        // Redirect to login page if not authenticated
        console.log('AuthGuard: User not authenticated, redirecting to store-specific login.');
        // Extract storeSlug from the state.url (e.g., /store-slug/account/overview -> store-slug)
        const urlSegments = state.url.split('/');
        const storeSlug = urlSegments.length > 1 ? urlSegments[1] : null; // Get the first segment after the initial '/'

        if (storeSlug) {
          // Redirect to the store-specific login page
          router.navigate(['/', storeSlug, 'login'], { queryParams: { returnUrl: state.url } });
        } else {
          // Fallback if storeSlug cannot be determined (should not happen with current routing)
          console.error('AuthGuard: Could not determine storeSlug from URL:', state.url);
          router.navigate(['/login']); // Redirect to a generic login or error page?
        }
        return false; // Block access
      }
    })
  );
};
