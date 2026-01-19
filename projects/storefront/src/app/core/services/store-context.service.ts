import { Injectable, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, tap, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Store } from '@shared-types';

@Injectable({
  providedIn: 'root'
})
export class StoreContextService {
  // Use BehaviorSubject to hold the current store slug and allow components to subscribe
  private currentStoreSlugSubject = new BehaviorSubject<string | null>(null);
  public currentStoreSlug$: Observable<string | null> = this.currentStoreSlugSubject.asObservable().pipe(distinctUntilChanged());

  private currentStoreDetailsSubject = new BehaviorSubject<Store | null>(null);
  public currentStoreDetails$: Observable<Store | null> = this.currentStoreDetailsSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    console.log('[StoreContextService] Constructor: Subscribing to router events.');
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      tap(event => console.log(`[StoreContextService] NavigationEnd event detected: ${event.urlAfterRedirects}`)),
      map(() => this.extractSlugFromRoute()),
      distinctUntilChanged(), // Only proceed if the slug has actually changed
      tap(slug => console.log(`[StoreContextService] Slug after distinctUntilChanged: ${slug}`))
    ).subscribe(slug => {
      if (slug !== this.currentStoreSlugSubject.value) {
        this.currentStoreSlugSubject.next(slug); // Update slug subject immediately
        // Clear store details when slug changes - they will be fetched externally
        this.currentStoreDetailsSubject.next(null);
      }
    });
  }

  // Method to be called during app initialization
  public initializeSlugFromUrl(url: string): void {
    console.log('[StoreContextService] Initializing slug from URL:', url);
    const slug = this.extractSlugFromPath(url);
    console.log('[StoreContextService] Extracted slug from initial URL:', slug);
    if (slug && slug !== this.currentStoreSlugSubject.value) {
      console.log('[StoreContextService] Setting initial slug:', slug);
      this.currentStoreSlugSubject.next(slug);
      // Clear store details - they will be fetched externally
      this.currentStoreDetailsSubject.next(null);
    } else if (!slug) {
      this.currentStoreSlugSubject.next(null);
      this.currentStoreDetailsSubject.next(null);
    }
  }

  private extractSlugFromPath(path: string): string | null {
    console.log('[StoreContextService] Extracting slug from path:', path);
    
    // Remove query parameters and fragments if present
    const cleanPath = path.split('?')[0].split('#')[0];
    console.log('[StoreContextService] Clean path after removing query/fragments:', cleanPath);
    
    // Basic extraction logic: assumes slug is the first part of the path
    // e.g., "/store-slug/some/page" -> "store-slug"
    const pathSegments = cleanPath.split('/').filter(segment => segment.length > 0);
    console.log('[StoreContextService] Path segments after split/filter:', pathSegments);
    
    if (pathSegments.length > 0) {
      const potentialSlug = pathSegments[0];
      console.log('[StoreContextService] Potential slug segment:', potentialSlug);
      
      // Check if the potential slug contains matrix parameters mistakenly
      if (potentialSlug.includes(';')) {
        console.warn('[StoreContextService] Potential slug contains a semicolon, which might indicate matrix parameters. Returning null.');
        return null;
      }
      
      // Additional validation: check if it's not a known static route
      // These routes are NOT store slugs and should be excluded from store context
      const staticRoutes = [
        '404',           // 404 error page
        'default',       // Default redirect route
        'marketplace',   // Global marketplace routes (future: /marketplace/stores, /marketplace/products, etc.)
        'stores',        // Global stores listing (future)
        'search',        // Global search (future)
        'account',       // Global account routes (if any)
        'checkout',      // Global checkout (if any)
        'cart',          // Global cart (if any)
      ];
      if (staticRoutes.includes(potentialSlug)) {
        console.log('[StoreContextService] Potential slug is a static route, returning null.');
        return null;
      }
      
      console.log('[StoreContextService] Returning extracted slug:', potentialSlug);
      return potentialSlug;
    }
    
    console.log('[StoreContextService] No valid slug found in path.');
    return null;
  }


  private extractSlugFromRoute(): string | null {
    // Use the router state snapshot after navigation ends for more accuracy
    let routeSnapshot = this.router.routerState.snapshot.root;

    console.log('[StoreContextService] Starting route extraction from root');
    console.log('[StoreContextService] Current URL:', this.router.url);

    // Check all route levels from root down for the storeSlug parameter
    while (routeSnapshot) {
      console.log('[StoreContextService] Checking route level:', routeSnapshot.url, 'Params:', routeSnapshot.params, 'ParamMap keys:', Array.from(routeSnapshot.paramMap.keys));
      
      if (routeSnapshot.paramMap.has('storeSlug')) {
        const slug = routeSnapshot.paramMap.get('storeSlug');
        console.log(`[StoreContextService] Found storeSlug "${slug}" in route level`);
        return slug;
      }
      
      // Move to the first child if it exists
      if (routeSnapshot.firstChild) {
        routeSnapshot = routeSnapshot.firstChild;
      } else {
        break;
      }
    }

    console.log('[StoreContextService] No storeSlug found in any route level.');
    
    // Fallback: try to extract from the URL directly
    const url = this.router.url;
    console.log('[StoreContextService] Attempting fallback extraction from URL:', url);
    return this.extractSlugFromPath(url);
  }

  // Method to update store details from external source (e.g., ApiService)
  public updateStoreDetails(storeDetails: Store | null): void {
    console.log('[StoreContextService] Updating store details:', storeDetails);
    this.currentStoreDetailsSubject.next(storeDetails);
  }

  // Method to get current slug synchronously
  getCurrentStoreSlug(): string | null {
    return this.currentStoreSlugSubject.value;
  }

  // Method to set store slug programmatically
  public setStoreSlug(slug: string | null): void {
    if (slug !== this.currentStoreSlugSubject.value) {
      this.currentStoreSlugSubject.next(slug);
      // Clear store details when slug changes
      this.currentStoreDetailsSubject.next(null);
    }
  }
}

