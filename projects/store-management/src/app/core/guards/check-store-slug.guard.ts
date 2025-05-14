import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckStoreSlugGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const storeSlug = route.paramMap.get('storeSlug');

    if (storeSlug) {
      // Store slug is present, allow activation
      return true;
    } else {
      // Store slug is missing, redirect to login or an error page
      console.warn('Store slug is missing from route. Redirecting to login.');
      // You might want to redirect to a dedicated "Store Not Found" page
      return this.router.createUrlTree(['/login']); // Redirect to login page
    }
  }
}