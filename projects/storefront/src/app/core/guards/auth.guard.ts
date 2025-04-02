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
        console.log('AuthGuard: User not authenticated, redirecting to login.');
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } }); // Pass returnUrl
        return false; // Block access
      }
    })
  );
};
