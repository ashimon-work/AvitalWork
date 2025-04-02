import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
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

  constructor() {
    this.featuredCategories$ = this.apiService.getFeaturedCategories();
    this.featuredProducts$ = this.apiService.getFeaturedProducts();
  }
}
