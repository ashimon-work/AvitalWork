import { Injectable, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreContextService {
  // Use BehaviorSubject to hold the current store slug and allow components to subscribe
  private currentStoreSlugSubject = new BehaviorSubject<string | null>(null);
  public currentStoreSlug$: Observable<string | null> = this.currentStoreSlugSubject.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.extractSlugFromRoute()) // Use helper function
    ).subscribe(slug => {
      if (slug !== this.currentStoreSlugSubject.value) {
        this.currentStoreSlugSubject.next(slug);
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
    // Traverse the route tree to find the activated route snapshot containing the slug
    let route = this.activatedRoute.firstChild;
    let slug: string | null = null;
    while (route) {
      if (route.snapshot.paramMap.has('storeSlug')) {
        slug = route.snapshot.paramMap.get('storeSlug');
        break; // Found the slug
      }
      // Check if the route itself has the slug (for root-level slugs if applicable)
      if (!route.firstChild && route.snapshot.paramMap.has('storeSlug')) {
         slug = route.snapshot.paramMap.get('storeSlug');
         break;
      }
      route = route.firstChild;
    }
    return slug;
  }

  getCurrentStoreSlug(): string | null {
    return this.currentStoreSlugSubject.value;
  }
}
