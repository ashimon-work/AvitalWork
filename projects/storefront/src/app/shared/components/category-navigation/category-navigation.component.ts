import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, Product } from '@shared-types'; // Import Category and Product types
import { RouterModule } from '@angular/router'; // Import RouterModule
import { Observable, switchMap, of, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { StoreContextService } from '../../../core/services/store-context.service';
import { FeaturedProductCardComponent } from '../featured-product-card/featured-product-card.component';

@Component({
  selector: 'app-category-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, FeaturedProductCardComponent], // Add FeaturedProductCardComponent
  templateUrl: './category-navigation.component.html',
  styleUrls: ['./category-navigation.component.scss'],
})
export class CategoryNavigationComponent implements OnInit {
  public categories$!: Observable<Category[]>;
  public categoryProducts$!: Observable<{
    products: Product[];
    total: number;
  } | null>;
  public selectedCategory: Category | null = null;
  public isLoading = false;

  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);
  private route = inject(ActivatedRoute);

  private categoryProductsSubject = new BehaviorSubject<{
    products: Product[];
    total: number;
  } | null>(null);

  ngOnInit() {
    this.categories$ = this.storeContext.currentStoreSlug$.pipe(
      switchMap((storeSlug) => {
        if (storeSlug) {
          return this.apiService.getStoreCategories(storeSlug);
        } else {
          return of([]);
        }
      })
    );

    this.categoryProducts$ = this.categoryProductsSubject.asObservable();
  }

  /**
   * Handle category click to fetch products
   * FIXED: Using correct API endpoint structure
   */
  onCategoryClick(category: Category): void {
    this.selectedCategory = category;
    this.isLoading = true;

    // FIXED: Use correct API structure: /api/stores/{storeSlug}/products?categoryId={categoryId}
    this.storeContext.currentStoreSlug$
      .pipe(
        switchMap((storeSlug) => {
          console.log('Current storeSlug:', storeSlug);
          if (storeSlug) {
            const queryParams = {
              category_id: category.id, // FIXED: Use categoryId parameter instead of category_id
              limit: 6, // Show more products in navigation
            };

            console.log(
              `[CategoryNavigationComponent] Fetching products for category "${category.name}" (ID: ${category.id}) from store "${storeSlug}" with params:`,
              queryParams
            );

            return this.apiService.getProducts(queryParams);
          }
           else {
            console.warn(
              '[CategoryNavigationComponent] No store slug available, returning empty products'
            );
            return of({ products: [], total: 0 });
          }
        })
      )
      .subscribe({
        next: (result) => {
          console.log(
            `[CategoryNavigationComponent] Received products for category "${category.name}":`,
            result
          );
          this.categoryProductsSubject.next(result);
          this.isLoading = false;
        },
        error: (error) => {
          console.error(
            `[CategoryNavigationComponent] Error fetching products for category "${category.name}":`,
            error
          );
          this.categoryProductsSubject.next({ products: [], total: 0 });
          this.isLoading = false;
        },
      });
  }

  /**
   * Track by function for ngFor to improve performance
   */
  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }

  /**
   * Track by function for products ngFor
   */
  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  /**
   * Check if current category is active based on route
   */
  // isActiveCategory(categoryId: string): boolean {
  //   const currentCategoryId = this.route.snapshot.paramMap.get('id');
  //   return currentCategoryId === categoryId;
  // }
}
