import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  private apiService = inject(ApiService);

  featuredCategories$: Observable<Category[]>;
  featuredProducts$: Observable<Product[]>;

  constructor() {
    this.featuredCategories$ = this.apiService.getFeaturedCategories();
    this.featuredProducts$ = this.apiService.getFeaturedProducts();
  }
}
