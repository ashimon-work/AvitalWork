import { Injectable, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreContextService {
  // Use BehaviorSubject to hold the current store slug and allow components to subscribe
  private currentStoreSlugSubject = new BehaviorSubject<string | null>(null);
  public currentStoreSlug$: Observable<string | null> = this.currentStoreSlugSubject.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    console.log('[StoreContextService] Constructor: Subscribing to router events.');
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd), // Type guard for event
      tap(event => console.log(`[StoreContextService] NavigationEnd event detected: ${event.urlAfterRedirects}`)),
      map(() => this.extractSlugFromRoute()) // Use helper function
    ).subscribe(slug => {
      const currentSlug = this.currentStoreSlugSubject.value;
      console.log(`[StoreContextService] Extracted slug: ${slug}, Current subject value: ${currentSlug}`);
      if (slug !== currentSlug) {
        console.log(`[StoreContextService] Updating slug subject to: ${slug}`);
        this.currentStoreSlugSubject.next(slug);
      } else {
        console.log(`[StoreContextService] Extracted slug is same as current, no update needed.`);
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
    }
  }

  private extractSlugFromPath(path: string): string | null {
    console.log('[StoreContextService] Extracting slug from path:', path);
    // Basic extraction logic: assumes slug is the first part of the path
    // e.g., "/store-slug/some/page" -> "store-slug"
    // Adjust this logic based on your actual URL structure
    const pathSegments = path.split('/').filter(segment => segment.length > 0);
    console.log('[StoreContextService] Path segments after split/filter:', pathSegments);
    if (pathSegments.length > 0) {
      // Add more robust checks if needed (e.g., regex, checking against a list of known slugs)
      const potentialSlug = pathSegments[0];
      console.log('[StoreContextService] Potential slug segment:', potentialSlug);
      // Check if the potential slug contains matrix parameters mistakenly
      if (potentialSlug.includes(';')) {
        console.warn('[StoreContextService] Potential slug contains a semicolon, which might indicate matrix parameters. Returning null.');
        return null; // Avoid using a segment with matrix parameters as a slug
      }
      return potentialSlug;
    }
    return null;
  }


  private extractSlugFromRoute(): string | null {
    // Use the router state snapshot after navigation ends for more accuracy
    let routeSnapshot = this.router.routerState.snapshot.root;

    // Traverse down the primary outlet path as far as possible
    while (routeSnapshot.firstChild) {
      routeSnapshot = routeSnapshot.firstChild;
    }

    // Check the deepest activated route and its parents for the slug
    while (routeSnapshot) {
      if (routeSnapshot.paramMap.has('storeSlug')) {
        const slug = routeSnapshot.paramMap.get('storeSlug');
        console.log(`[StoreContextService] Extracted slug "${slug}" from route snapshot.`);
        return slug;
      }
      // Check parent route only if routeSnapshot.parent exists
      if (!routeSnapshot.parent) break;
      routeSnapshot = routeSnapshot.parent;
    }

    console.log('[StoreContextService] No storeSlug found in the current route snapshot path.');
    return null; // No slug found in the activated path
  }

  getCurrentStoreSlug(): string | null {
    return this.currentStoreSlugSubject.value;
  }
}
