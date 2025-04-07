import { Component, inject } from '@angular/core';
import { startWith } from 'rxjs';
import { Observable } from 'rxjs';
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
  currentStoreSlug: string | null = this.storeContext.getCurrentStoreSlug();
  carouselSlides$: Observable<CarouselSlide[]>;

  constructor() {
    this.featuredCategories$ = this.apiService.getFeaturedCategories();

    this.featuredProducts$ = this.apiService.getFeaturedProducts();


    this.carouselSlides$ = this.apiService.getCarouselImages().pipe(startWith([]));
  }
}
