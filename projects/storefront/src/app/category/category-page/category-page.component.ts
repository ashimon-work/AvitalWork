import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { FeaturedProductCardComponent } from '../../shared/components/featured-product-card/featured-product-card.component';
import { CategoryNavigationComponent } from '../../shared/components/category-navigation/category-navigation.component';
import { Observable, switchMap, tap, map, BehaviorSubject, combineLatest, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, RouterLink, Router, Params } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { I18nService } from '@shared/i18n';

interface Filters {
  price_min?: number;
  price_max?: number;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
}

interface DisplayableFilterItem {
  value: string;
  translationKey: keyof typeof T;
}

interface DisplayableColorItem extends DisplayableFilterItem {
  colorHex: string;
}

interface PriceRangeFilterItem {
  id: string; // e.g., '0-20'
  labelTranslationKey: keyof typeof T;
  min?: number;
  max?: number;
}

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FeaturedProductCardComponent,
    CategoryNavigationComponent,
    TranslatePipe
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss'
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  public tKeys = T;
  category$: Observable<Category | null> | undefined;
  products$: Observable<Product[]> | undefined;
  totalProducts$: Observable<number> | undefined;
  currentCategoryId$?: Observable<string>;

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
  // selectedPriceRange: string = ''; // Replaced by selectedPriceRanges
  selectedPriceRanges: { [key: string]: boolean } = {}; // For checkbox-based price ranges
  selectedTags: { [key: string]: boolean } = {}; // e.g., { 'New': true, 'Sale': false }
  selectedColors: { [key: string]: boolean } = {};
  selectedSizes: { [key: string]: boolean } = {};
  isMobileFiltersVisible: boolean = false; // State for mobile filter overlay

  // Placeholder available options for filters
  // availableColors: string[] = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Gray'];
  // availableSizes: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  availableTags: DisplayableFilterItem[];
  availableColors: DisplayableColorItem[];
  availableSizes: DisplayableFilterItem[];
  availablePriceRanges: PriceRangeFilterItem[];

  public filterSectionOpenState: { [key: string]: boolean } = {
    price: true,
    tags: true,
    colors: true,
    sizes: true
  };


  // Template references for click outside detection
  @ViewChild('filterButton') filterButton!: ElementRef;
  @ViewChild('mobileFilterOverlay') mobileFilterOverlay!: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private storeContext: StoreContextService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private i18nService: I18nService
  ) {
    this.currentStoreSlug$ = this.storeContext.currentStoreSlug$; // Assign slug observable

    this.availableTags = ['New', 'Sale', 'Featured'].map(tag => ({
      value: tag,
      translationKey: `SF_CATEGORY_TAG_${tag.toUpperCase()}` as keyof typeof T
    }));

    // Updated availableColors with softer hex values
    this.availableColors = [
      { value: 'Red', translationKey: 'SF_COLOR_RED' as keyof typeof T, colorHex: '#F28B82' }, // Soft Red
      { value: 'Blue', translationKey: 'SF_COLOR_BLUE' as keyof typeof T, colorHex: '#89B4F8' }, // Soft Blue
      { value: 'Green', translationKey: 'SF_COLOR_GREEN' as keyof typeof T, colorHex: '#81C995' }, // Muted Green
      { value: 'Black', translationKey: 'SF_COLOR_BLACK' as keyof typeof T, colorHex: '#5F6368' }, // Dark Gray (softer than pure black)
      { value: 'White', translationKey: 'SF_COLOR_WHITE' as keyof typeof T, colorHex: '#FFFFFF' },
      { value: 'Yellow', translationKey: 'SF_COLOR_YELLOW' as keyof typeof T, colorHex: '#FDD663' }, // Soft Yellow
      { value: 'Purple', translationKey: 'SF_COLOR_PURPLE' as keyof typeof T, colorHex: '#B39DDB' }, // Lavender
      { value: 'Orange', translationKey: 'SF_COLOR_ORANGE' as keyof typeof T, colorHex: '#FDBA74' }, // Soft Orange
      { value: 'Pink', translationKey: 'SF_COLOR_PINK' as keyof typeof T, colorHex: '#F48FB1' }, // Soft Pink
      { value: 'Brown', translationKey: 'SF_COLOR_BROWN' as keyof typeof T, colorHex: '#BCAAA4' }, // Light/Muted Brown
      { value: 'Gray', translationKey: 'SF_COLOR_GRAY' as keyof typeof T, colorHex: '#BDBDBD' }  // Medium Gray
    ];


    this.availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => ({
      value: size,
      translationKey: `SF_SIZE_${size.toUpperCase()}` as keyof typeof T
    }));

    this.availablePriceRanges = [
      { id: '0-20', labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_0_20', min: 0, max: 20 },
      { id: '20-50', labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_20_50', min: 20, max: 50 },
      { id: '50-100', labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_50_100', min: 50, max: 100 },
      { id: '100-Infinity', labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_100_PLUS', min: 100 }
    ];
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

    this.currentCategoryId$ = categoryId$;

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

    // Price ranges from query params (e.g., price_ranges=0-20,20-50)
    if (queryParams['price_ranges']) {
      const priceRangeIds = queryParams['price_ranges'].split(',');
      priceRangeIds.forEach((id: string) => {
        if (this.availablePriceRanges.some(r => r.id === id)) {
          this.selectedPriceRanges[id] = true;
        }
      });
      // Derive price_min and price_max from selectedPriceRanges for initialFilters
      const activePriceRanges = this.availablePriceRanges.filter(r => this.selectedPriceRanges[r.id]);
      if (activePriceRanges.length > 0) {
        initialFilters.price_min = Math.min(...activePriceRanges.map(r => r.min || 0).filter((min): min is number => min !== undefined));
        const maxValues = activePriceRanges.map(r => r.max).filter((max): max is number => max !== undefined);
        if (maxValues.length > 0 && !activePriceRanges.some(r => r.max === undefined)) {
          initialFilters.price_max = Math.max(...maxValues);
        } else if (activePriceRanges.some(r => r.max === undefined) && maxValues.length > 0) {
          // If "100+" is selected with other ranges, effectively no upper bound from those with max.
          // This logic might need refinement based on desired behavior if "100+" is combined.
          // For now, if "100+" is selected, price_max is undefined.
           if (activePriceRanges.some(r => r.max === undefined)) {
            initialFilters.price_max = undefined;
           } else {
            initialFilters.price_max = Math.max(...maxValues);
           }
        } else if (activePriceRanges.some(r => r.max === undefined)) {
            initialFilters.price_max = undefined;
        }
      }
    } else {
        // Legacy support for price_min/price_max if price_ranges is not present
        if (queryParams['price_min']) initialFilters.price_min = +queryParams['price_min'];
        if (queryParams['price_max']) initialFilters.price_max = +queryParams['price_max'];
        // Try to map back to a selectedPriceRange if only min/max are provided
        const matchedRange = this.availablePriceRanges.find(r => r.min === initialFilters.price_min && r.max === initialFilters.price_max);
        if (matchedRange) {
            this.selectedPriceRanges[matchedRange.id] = true;
        } else if (initialFilters.price_min === 100 && initialFilters.price_max === undefined) {
            const plusRange = this.availablePriceRanges.find(r => r.id === '100-Infinity');
            if (plusRange) this.selectedPriceRanges[plusRange.id] = true;
        }
    }


    if (queryParams['tags']) initialFilters.tags = queryParams['tags'].split(',');
    if (queryParams['colors']) initialFilters.colors = queryParams['colors'].split(',');
    if (queryParams['sizes']) initialFilters.sizes = queryParams['sizes'].split(',');

    // Initialize local state for filter inputs based on query params
    // this.selectedPriceRange = this.determinePriceRangeString(initialFilters.price_min, initialFilters.price_max); // Removed
    this.selectedTags = (initialFilters.tags || []).reduce((acc, tag) => {
      acc[tag] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    this.selectedColors = (initialFilters.colors || []).reduce((acc, color) => {
      acc[color] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    this.selectedSizes = (initialFilters.sizes || []).reduce((acc, size) => {
      acc[size] = true;
      return acc;
    }, {} as { [key: string]: boolean });

    this.filtersSubject.next(initialFilters);
    this.sortSubject.next(queryParams['sort'] || 'newest');
    this.pageSubject.next(queryParams['page'] ? +queryParams['page'] : 1);
  }

  // determinePriceRangeString(min?: number, max?: number): string { // No longer needed
  //   if (min === undefined && max === undefined) return '';
  //   return `${min || 0}-${max || 'Infinity'}`;
  // }

  applyFilters(): void {
    const newFilters: Filters = {};

    // Price Range Logic from Checkboxes
    const activePriceRangeIds = Object.keys(this.selectedPriceRanges).filter(id => this.selectedPriceRanges[id]);
    if (activePriceRangeIds.length > 0) {
      const activeRanges = this.availablePriceRanges.filter(r => activePriceRangeIds.includes(r.id));
      if (activeRanges.length > 0) {
        newFilters.price_min = Math.min(...activeRanges.map(r => r.min || 0).filter((min): min is number => min !== undefined));
        
        const hasInfiniteRange = activeRanges.some(r => r.max === undefined);
        if (hasInfiniteRange) {
          newFilters.price_max = undefined;
        } else {
          const maxValues = activeRanges.map(r => r.max).filter((max): max is number => max !== undefined);
          if (maxValues.length > 0) {
            newFilters.price_max = Math.max(...maxValues);
          }
        }
      }
    }


    // Tags Logic
    const activeTags = Object.keys(this.selectedTags).filter(tag => this.selectedTags[tag]);
    if (activeTags.length > 0) {
      newFilters.tags = activeTags;
    }

    // Colors Logic
    const activeColors = Object.keys(this.selectedColors).filter(color => this.selectedColors[color]);
    if (activeColors.length > 0) {
      newFilters.colors = activeColors;
    }

    // Sizes Logic
    const activeSizes = Object.keys(this.selectedSizes).filter(size => this.selectedSizes[size]);
    if (activeSizes.length > 0) {
      newFilters.sizes = activeSizes;
    }

    this.filtersSubject.next(newFilters);
    this.pageSubject.next(1); // Reset page on filter change
  }


  clearFilters(): void {
    this.selectedPriceRanges = {};
    this.selectedTags = {};
    this.selectedColors = {};
    this.selectedSizes = {};
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
    // Price min/max are already correctly in filters object from applyFilters()
    if (filters.price_min !== undefined) apiParams.price_min = filters.price_min;
    if (filters.price_max !== undefined) apiParams.price_max = filters.price_max;
    // If we wanted to send price range IDs instead:
    // const activePriceRangeIds = Object.keys(this.selectedPriceRanges).filter(id => this.selectedPriceRanges[id]);
    // if (activePriceRangeIds.length > 0) apiParams.price_ranges = activePriceRangeIds.join(',');

    if (filters.tags && filters.tags.length > 0) apiParams.tags = filters.tags.join(',');
    if (filters.colors && filters.colors.length > 0) apiParams.colors = filters.colors.join(',');
    if (filters.sizes && filters.sizes.length > 0) apiParams.sizes = filters.sizes.join(',');
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

    // Query params for price ranges
    const activePriceRangeIds = Object.keys(this.selectedPriceRanges).filter(id => this.selectedPriceRanges[id]);
    if (activePriceRangeIds.length > 0) {
      queryParams['price_ranges'] = activePriceRangeIds.join(',');
    } else {
      // Remove legacy price_min/price_max if no ranges are selected
      delete queryParams['price_min'];
      delete queryParams['price_max'];
    }
    // Keep sending price_min and price_max for API compatibility if they exist on currentFilters
    // This part might be redundant if price_ranges is the sole source of truth for URL
    // However, mapFiltersToApiParams still uses price_min/max from the Filters object.
    // For now, let price_ranges drive the URL, and applyFilters drives the Filters object.
    // if (currentFilters.price_min !== undefined) {
    //   queryParams['price_min'] = currentFilters.price_min;
    // }
    // if (currentFilters.price_max !== undefined) {
    //   queryParams['price_max'] = currentFilters.price_max;
    // }


    if (currentFilters.tags && currentFilters.tags.length > 0) {
      queryParams['tags'] = currentFilters.tags.join(',');
    }
    if (currentFilters.colors && currentFilters.colors.length > 0) {
      queryParams['colors'] = currentFilters.colors.join(',');
    }
    if (currentFilters.sizes && currentFilters.sizes.length > 0) {
      queryParams['sizes'] = currentFilters.sizes.join(',');
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

  toggleFilterSection(section: string): void {
    if (this.filterSectionOpenState.hasOwnProperty(section)) {
      this.filterSectionOpenState[section] = !this.filterSectionOpenState[section];
    }
  }

  isFilterSectionOpen(section: string): boolean {
    return !!this.filterSectionOpenState[section];
  }

  getChevronIcon(section: string): string {
    // Always return chevron-right, SCSS will handle rotation
    return 'assets/icons/chevron-right.svg';
  }

  toggleMobileFilters(): void {
    this.isMobileFiltersVisible = !this.isMobileFiltersVisible;
  }

  // Listen for clicks anywhere in the document
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Check if the click target exists and the overlay is actually visible
    if (!event.target || !this.isMobileFiltersVisible) {
      return;
    }

    const clickedInsideButton = this.filterButton?.nativeElement?.contains(event.target);
    const clickedInsideOverlay = this.mobileFilterOverlay?.nativeElement?.contains(event.target);

    // If the click was outside both the button and the overlay, close the overlay
    if (!clickedInsideButton && !clickedInsideOverlay) {
      this.isMobileFiltersVisible = false;
    }
  }

  onAddToCart(product: Product): void {
    if (!product || !product.id) {
      console.error('Invalid product data received for AddToCart:', product);
      this.notificationService.showError(this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_ERROR_NOTIFICATION));
      return;
    }

    this.cartService.addItem(product).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_SUCCESS_NOTIFICATION, 1, product.name) // Assuming quantity 1 for now
        );
      },
      error: (error: any) => {
        console.error('Error adding product to cart from category page:', error);
        this.notificationService.showError(this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_ERROR_NOTIFICATION));
      }
    });
  }
}
