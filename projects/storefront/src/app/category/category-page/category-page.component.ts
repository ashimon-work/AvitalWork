import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { ProductListingComponent } from '../../shared/components/product-listing/product-listing.component';
import { CategoryNavigationComponent } from '../../shared/components/category-navigation/category-navigation.component';
import { Observable, switchMap, tap, map, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProductListingComponent,
    CategoryNavigationComponent,
    TranslatePipe
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss'
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  public tKeys = T;
  category$: Observable<Category | null> | undefined;
  currentCategoryId$?: Observable<string>;
  currentStoreSlug$: Observable<string | null>;
  queryParams$: Observable<Params>;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private storeContext: StoreContextService
  ) {
    this.currentStoreSlug$ = this.storeContext.currentStoreSlug$;
    this.queryParams$ = this.route.queryParams.pipe(
      map(params => ({ ...params })),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    const categoryId$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      tap(id => {
        if (!id) {
          this.router.navigate(['/']);
        }
      }),
      map(id => id!),
      takeUntil(this.destroy$)
    );

    this.currentCategoryId$ = categoryId$;

    this.category$ = categoryId$.pipe(
      switchMap(id => this.apiService.getCategoryDetails(id)),
      tap(category => {
        if (!category) {
          this.router.navigate(['/not-found']);
        }
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddToCart(product: Product): void {
    // This is handled by the ProductListingComponent
    // This method is kept for potential future use
  }
}
