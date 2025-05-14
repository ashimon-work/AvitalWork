import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service'; // Assuming AuthService is in auth module

@Injectable({
  providedIn: 'root',
})
export class ManagementAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const storeSlug = route.params['storeSlug'] || route.parent?.params['storeSlug'];

    return this.authService.isAuthenticated().pipe(
      take(1),
      map((isAuthenticated) => {
        console.log('ManagementAuthGuard: isAuthenticated =', isAuthenticated);
        if (isAuthenticated) {
          console.log('ManagementAuthGuard: Access granted.');
          // TODO: Add role check here if needed for manager roles
          // For now, just being authenticated is enough
          return true;
        }
        console.log('ManagementAuthGuard: Access denied. storeSlug =', storeSlug, 'Target URL =', state.url);
        // Not authenticated, redirect to login page, preserving storeSlug
        if (storeSlug) {
          this.router.navigate(['/', storeSlug, 'login'], {
            queryParams: { returnUrl: state.url },
          });
          return false; // Prevent activation after navigation
        } else {
          console.error('ManagementAuthGuard: storeSlug is missing! Cannot redirect to store-specific login. Fallback to generic login.');
          // Fallback if storeSlug is somehow lost, though this shouldn't happen with proper routing
          this.router.navigate(['/login'], { // Or a generic error/home page
            queryParams: { returnUrl: state.url },
          });
          return false; // Prevent activation after navigation
        }
      })
    );
  }
}