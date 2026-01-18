import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, Params } from '@angular/router';
import { Observable, switchMap, map, filter, take } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { Category, Product } from '@shared-types';
import { T, TranslatePipe } from '@shared/i18n';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { CartService } from '../../core/services/cart.service';
import { ProductListingComponent } from '../../shared/components/product-listing/product-listing.component';
import { CategoryNavigationComponent } from '../../shared/components/category-navigation/category-navigation.component';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    ProductListingComponent,
    CategoryNavigationComponent,
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss',
})
export class CategoryPageComponent implements OnInit {
  public tKeys = T;

  // Inject dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);
  private cartService = inject(CartService);

  // Keep Observables for category data (needed for *ngIf="category$ | async")
  category$!: Observable<Category>;
  currentCategoryId$!: Observable<string>;

  // Convert to signals for efficient template binding
  // Signals only trigger updates when actual values change, not just references
  readonly currentStoreSlug = toSignal(this.storeContext.currentStoreSlug$, {
    initialValue: null,
  });
  readonly queryParams = toSignal(this.route.queryParams, {
    initialValue: {} as Params,
  });

  ngOnInit(): void {
    this.currentCategoryId$ = this.route.paramMap.pipe(
      map((p) => p.get('id')),
      filter((id): id is string => {
        if (!id) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );

    this.category$ = this.currentCategoryId$.pipe(
      switchMap((id) => this.apiService.getCategoryDetails(id)),
      filter((category): category is Category => {
        if (!category) {
          this.router.navigate(['/not-found']);
          return false;
        }
        return true;
      })
    );
  }

  onAddToCart(product: Product): void {
    this.cartService
      .addItem(product)
      .pipe(take(1))
      .subscribe({
        error: (error: any) => {
          console.error('Error adding product to cart:', error);
        },
      });
  }
}
