import { Injectable, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root' // Provided globally
})
export class StoreContextService {
  // Use BehaviorSubject to hold the current store slug and allow components to subscribe
  private currentStoreSlugSubject = new BehaviorSubject<string | null>(null);
  public currentStoreSlug$: Observable<string | null> = this.currentStoreSlugSubject.asObservable();

  // Alternatively, use a signal for simpler state management in newer Angular versions
  // public currentStoreSlug = signal<string | null>(null);

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        // Traverse the route tree to find the activated route snapshot containing the slug
        let route = this.activatedRoute.firstChild;
        let slug: string | null = null;
        while (route) {
          if (route.snapshot.paramMap.has('storeSlug')) {
            slug = route.snapshot.paramMap.get('storeSlug');
            break; // Found the slug
          }
          route = route.firstChild;
        }
        return slug;
      })
    ).subscribe(slug => {
      if (slug !== this.currentStoreSlugSubject.value) {
        this.currentStoreSlugSubject.next(slug);
        // If using signal: this.currentStoreSlug.set(slug);
        // console.log('Store Slug Context Updated:', slug); // For debugging
      }
    });
  }

  // Helper method to get the current slug synchronously if needed (use with caution)
  getCurrentStoreSlug(): string | null {
    return this.currentStoreSlugSubject.value;
    // If using signal: return this.currentStoreSlug();
  }
}