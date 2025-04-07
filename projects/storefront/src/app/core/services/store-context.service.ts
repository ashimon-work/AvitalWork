import { Injectable, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreContextService {

  public currentStoreSlug = signal<string | null>(null);

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let slug: string | null = this.findStoreSlug(this.activatedRoute.firstChild);
        return slug;
      })
    ).subscribe(slug => {
      if (slug !== this.currentStoreSlug()) {
        this.currentStoreSlug.set(slug);
        console.log('Store Slug Context Updated:', slug);
      }
    });
  }

  getCurrentStoreSlug(): string | null {
    return this.currentStoreSlug();
  }
  private findStoreSlug(route: ActivatedRoute | null): string | null {
    while (route) {
      if (route.snapshot.paramMap.has('storeSlug')) {
        return route.snapshot.paramMap.get('storeSlug');
      }
      route = route.firstChild;
    }
    return null;
  }
}