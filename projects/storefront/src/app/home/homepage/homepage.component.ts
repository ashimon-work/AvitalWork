import { Component, inject } from '@angular/core';
import { startWith, tap, catchError, Observable, of } from 'rxjs'; // Import tap, catchError, of
import { Category, Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { CarouselSlide } from '../components/carousel/carousel.component';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);
  featuredCategories$: Observable<Category[]>;
  featuredProducts$: Observable<Product[]>;
  currentStoreSlug$: Observable<string | null> = this.storeContext.currentStoreSlug$;
  carouselSlides$: Observable<CarouselSlide[]>;

  constructor() {
    console.log('<<<<< HomepageComponent Constructor Start >>>>>'); // Add this very first line
    console.log('[HomepageComponent] Fetching featured categories...');
    this.featuredCategories$ = this.apiService.getFeaturedCategories().pipe(
      tap(categories => console.log('[HomepageComponent] Featured categories fetched:', categories)),
      catchError(error => {
        console.error('[HomepageComponent] Error fetching featured categories:', error);
        return of([]);
      })
    );

    this.featuredProducts$ = this.apiService.getFeaturedProducts();


    this.carouselSlides$ = this.apiService.getCarouselImages().pipe(startWith([]));
  }
}
