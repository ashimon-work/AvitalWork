import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service'; // Import StoreContextService
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Observable, switchMap, tap, map, BehaviorSubject, combineLatest, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, RouterLink, Router, Params } from '@angular/router';

interface Filters {
  price_min?: number;
  price_max?: number;
  tags?: string[];
  // Add other potential filter properties here (e.g., color, size)
}

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ProductCardComponent
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss'
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  category$: Observable<Category | null> | undefined;
  products$: Observable<Product[]> | undefined;
  totalProducts$: Observable<number> | undefined;

  private filtersSubject = new BehaviorSubject<Filters>({});
  filters$ = this.filtersSubject.asObservable();

  // Made public for template binding
  sortSubject = new BehaviorSubject<string>('newest');
  sort$ = this.sortSubject.asObservable();

  // Made public for template binding
  pageSubject = new BehaviorSubject<number>(1);
  page$ = this.pageSubject.asObservable();

  itemsPerPage = 12;

  private destroy$ = new Subject<void>();
  currentStoreSlug$: Observable<string | null>; // Add slug observable

  // Properties to bind to filter inputs in the template
  selectedPriceRange: string = ''; // e.g., '0-20', '20-50'
  selectedTags: { [key: string]: boolean } = {}; // e.g., { 'New': true, 'Sale': false }
  isMobileFiltersVisible: boolean = false; // State for mobile filter overlay

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private storeContext: StoreContextService // Inject StoreContextService
  ) {
    this.currentStoreSlug$ = this.storeContext.currentStoreSlug$; // Assign slug observable
  }

  ngOnInit(): void {
    this.initializeFromQueryParams();

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

    this.category$ = categoryId$.pipe(
      switchMap(id => this.apiService.getCategoryDetails(id)),
      tap(category => {
        if (!category) {
          this.router.navigate(['/not-found']); // Or handle differently
        }
      }),
      takeUntil(this.destroy$)
    );

    const productResponse$ = combineLatest([
      categoryId$,
      this.filters$,
      this.sort$,
      this.page$
    ]).pipe(
      switchMap(([categoryId, filters, sort, page]) => {
        const params: any = {
          category_id: categoryId,
          sort: sort,
          page: page,
          limit: this.itemsPerPage,
          ...this.mapFiltersToApiParams(filters)
        };
        // Remove null/undefined params before sending
        Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);
        return this.apiService.getProducts(params); // Expects { products: Product[], total: number }
      }),
      tap(() => this.updateUrlQueryParams()), // Update URL whenever params change
      takeUntil(this.destroy$)
    );

    this.products$ = productResponse$.pipe(map(response => response?.products || []));
    this.totalProducts$ = productResponse$.pipe(map(response => response?.total || 0));

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeFromQueryParams(): void {
    const queryParams = this.route.snapshot.queryParams;
    const initialFilters: Filters = {};
    if (queryParams['price_min']) initialFilters.price_min = +queryParams['price_min'];
    if (queryParams['price_max']) initialFilters.price_max = +queryParams['price_max'];
    if (queryParams['tags']) initialFilters.tags = queryParams['tags'].split(',');

    // Initialize local state for filter inputs based on query params
    this.selectedPriceRange = this.determinePriceRangeString(initialFilters.price_min, initialFilters.price_max);
    this.selectedTags = (initialFilters.tags || []).reduce((acc, tag) => {
      acc[tag] = true;
      return acc;
    }, {} as { [key: string]: boolean });


    this.filtersSubject.next(initialFilters);
    this.sortSubject.next(queryParams['sort'] || 'newest');
    this.pageSubject.next(queryParams['page'] ? +queryParams['page'] : 1);
  }

  determinePriceRangeString(min?: number, max?: number): string {
    if (min === undefined && max === undefined) return '';
    return `${min || 0}-${max || 'Infinity'}`; // Adjust representation as needed
  }

  applyFilters(): void {
    const newFilters: Filters = {};

    // Price Range Logic
    if (this.selectedPriceRange) {
      const parts = this.selectedPriceRange.split('-');
      if (parts.length === 2) {
        const min = parseInt(parts[0], 10);
        const max = parts[1] === 'Infinity' ? undefined : parseInt(parts[1], 10);
        if (!isNaN(min)) newFilters.price_min = min;
        if (max !== undefined && !isNaN(max)) newFilters.price_max = max;
      }
    }

    // Tags Logic
    const activeTags = Object.keys(this.selectedTags).filter(tag => this.selectedTags[tag]);
    if (activeTags.length > 0) {
      newFilters.tags = activeTags;
    }

    this.filtersSubject.next(newFilters);
    this.pageSubject.next(1); // Reset page on filter change
  }


  clearFilters(): void {
    this.selectedPriceRange = '';
    this.selectedTags = {};
    this.filtersSubject.next({});
    this.pageSubject.next(1);
  }

  onSortChange(newValue: string): void { // Changed parameter type from Event to string
    // The newValue is passed directly from (ngModelChange)
    this.sortSubject.next(newValue);
    this.pageSubject.next(1);
  }

  onPageChange(page: number): void {
    this.pageSubject.next(page);
  }

  private mapFiltersToApiParams(filters: Filters): any {
    const apiParams: any = {};
    if (filters.price_min !== undefined) apiParams.price_min = filters.price_min;
    if (filters.price_max !== undefined) apiParams.price_max = filters.price_max;
    if (filters.tags && filters.tags.length > 0) apiParams.tags = filters.tags.join(',');
    return apiParams;
  }

  private updateUrlQueryParams(): void {
    const queryParams: Params = {};
    const currentFilters = this.filtersSubject.getValue();
    const currentSort = this.sortSubject.getValue();
    const currentPage = this.pageSubject.getValue();

    if (currentSort !== 'newest') {
      queryParams['sort'] = currentSort;
    }
    if (currentPage > 1) {
      queryParams['page'] = currentPage;
    }
    if (currentFilters.price_min !== undefined) {
      queryParams['price_min'] = currentFilters.price_min;
    }
    if (currentFilters.price_max !== undefined) {
      queryParams['price_max'] = currentFilters.price_max;
    }
    if (currentFilters.tags && currentFilters.tags.length > 0) {
      queryParams['tags'] = currentFilters.tags.join(',');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // Added method for pagination calculation
  calculateTotalPages(totalItems: number | null): number {
    if (!totalItems || totalItems <= 0) {
      return 1; // Or 0, depending on desired behavior for no items
    }
    return Math.ceil(totalItems / this.itemsPerPage);
  }

  toggleMobileFilters(): void {
    this.isMobileFiltersVisible = !this.isMobileFiltersVisible;
  }
}
