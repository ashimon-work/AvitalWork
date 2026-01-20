import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '@shared-types';
import { ApiService } from '../../../core/services/api.service';
import { FeaturedProductCardComponent } from '../featured-product-card/featured-product-card.component';
import {
  Observable,
  switchMap,
  map,
  BehaviorSubject,
  Subject,
  takeUntil,
  combineLatest as rxjsCombineLatest,
  take,
  tap,
} from 'rxjs';
import { Router, Params } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { I18nService } from '@shared/i18n';

interface Filters {
  price_min?: number;
  price_max?: number;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
}

interface SortOption {
  value: string;
  label: keyof typeof T;
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

interface ProductQueryParams {
  sort: string;
  page: number;
  limit: number;
  category_id?: string;
  price_min?: number;
  price_max?: number;
  tags?: string;
  colors?: string;
  sizes?: string;
}

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FeaturedProductCardComponent,
    TranslatePipe,
  ],
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.scss',
})
export class ProductListingComponent implements OnInit, OnDestroy {
  public tKeys = T;
  products$: Observable<Product[]> | undefined;
  totalProducts$: Observable<number> | undefined;
  @Input() storeSlug: string | null = null;

  private _categoryId?: string;
  @Input() set categoryId(value: string | undefined) {
    this._categoryId = value;
    this.categoryIdSubject.next(value);
  }
  get categoryId(): string | undefined {
    return this._categoryId;
  }
  @Input() pageTitle?: string;
  @Input() showCategoryNavigation = false;
  @Input() queryParams: Params = {};

  @Output() addToCart = new EventEmitter<Product>();

  private categoryIdSubject = new BehaviorSubject<string | undefined>(
    undefined
  );
  categoryId$ = this.categoryIdSubject.asObservable();

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

  // Signals for efficient template binding (computed values that only update when dependencies change)
  // Writable signals that are updated when the corresponding Observables emit
  private totalProductsSignal = signal<number>(0);
  private pageSignal = signal<number>(1);
  private sortSignal = signal<string>('newest');

  // Computed signals that only recalculate when their dependencies change
  // Replaces the problematic getSortLabel() function call in template
  readonly sortLabel = computed(() => {
    const currentSort = this.sortSignal();
    const selectedOption = this.sortOptions.find(
      (opt) => opt.value === currentSort
    );
    const translationKey = selectedOption
      ? selectedOption.label
      : 'SF_CATEGORY_SORT_NEWEST';
    return this.i18nService.translate(translationKey);
  });

  // Replaces the problematic calculateTotalPages() function call in template
  readonly totalPages = computed(() => {
    const totalItems = this.totalProductsSignal();
    if (!totalItems || totalItems <= 0) {
      return 1;
    }
    return Math.ceil(totalItems / this.itemsPerPage);
  });

  // Replaces the problematic getPageNumbers() function call in template
  readonly pageNumbers = computed(() => {
    const totalPages = this.totalPages();
    const currentPage = this.pageSignal();
    const pages: number[] = [];

    if (totalPages === 1) {
      pages.push(1);
    } else if (currentPage === 1) {
      // First page: show 1 and 2
      pages.push(1, 2);
    } else if (currentPage === totalPages) {
      // Last page: show last-1 and last
      pages.push(totalPages - 1, totalPages);
    } else {
      // Middle page: show previous, current, next
      pages.push(currentPage - 1, currentPage, currentPage + 1);
    }

    return pages;
  });

  // Properties to bind to filter inputs in the template
  selectedPriceRanges: { [key: string]: boolean } = {}; // For checkbox-based price ranges
  selectedTags: { [key: string]: boolean } = {}; // e.g., { 'New': true, 'Sale': false }
  selectedColors: { [key: string]: boolean } = {};
  selectedSizes: { [key: string]: boolean } = {};
  isMobileFiltersVisible: boolean = false; // State for mobile filter overlay
  isSortDropdownOpen: boolean = false; // State for sort dropdown
  sortOptions: SortOption[] = [
    { value: 'newest', label: 'SF_CATEGORY_SORT_NEWEST' },
    { value: 'price-asc', label: 'SF_CATEGORY_SORT_PRICE_LOW_HIGH' },
    { value: 'price-desc', label: 'SF_CATEGORY_SORT_PRICE_HIGH_LOW' },
    { value: 'name-asc', label: 'SF_CATEGORY_SORT_NAME_A_Z' },
  ];

  // Icon paths to avoid duplication in template
  readonly chevronIcon = 'assets/icons/chevron-right.svg';

  // Available options for filters
  availableTags: DisplayableFilterItem[];
  availableColors: DisplayableColorItem[];
  availableSizes: DisplayableFilterItem[];
  availablePriceRanges: PriceRangeFilterItem[];

  public filterSectionOpenState: { [key: string]: boolean } = {
    price: true,
    tags: true,
    colors: true,
    sizes: true,
  };

  // Template references for click outside detection
  @ViewChild('filterButton') filterButton!: ElementRef;
  @ViewChild('sortDropdown') sortDropdown!: ElementRef;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private i18nService: I18nService
  ) {
    this.availableTags = ['New', 'Sale', 'Featured'].map((tag) => ({
      value: tag,
      translationKey: `SF_CATEGORY_TAG_${tag.toUpperCase()}` as keyof typeof T,
    }));

    // Updated availableColors with softer hex values
    this.availableColors = [
      {
        value: 'Red',
        translationKey: 'SF_COLOR_RED' as keyof typeof T,
        colorHex: '#F28B82',
      }, // Soft Red
      {
        value: 'Blue',
        translationKey: 'SF_COLOR_BLUE' as keyof typeof T,
        colorHex: '#89B4F8',
      }, // Soft Blue
      {
        value: 'Green',
        translationKey: 'SF_COLOR_GREEN' as keyof typeof T,
        colorHex: '#81C995',
      }, // Muted Green
      {
        value: 'Black',
        translationKey: 'SF_COLOR_BLACK' as keyof typeof T,
        colorHex: '#5F6368',
      }, // Dark Gray (softer than pure black)
      {
        value: 'White',
        translationKey: 'SF_COLOR_WHITE' as keyof typeof T,
        colorHex: '#FFFFFF',
      },
      {
        value: 'Yellow',
        translationKey: 'SF_COLOR_YELLOW' as keyof typeof T,
        colorHex: '#FDD663',
      }, // Soft Yellow
      {
        value: 'Purple',
        translationKey: 'SF_COLOR_PURPLE' as keyof typeof T,
        colorHex: '#B39DDB',
      }, // Lavender
      {
        value: 'Orange',
        translationKey: 'SF_COLOR_ORANGE' as keyof typeof T,
        colorHex: '#FDBA74',
      }, // Soft Orange
      {
        value: 'Pink',
        translationKey: 'SF_COLOR_PINK' as keyof typeof T,
        colorHex: '#F48FB1',
      }, // Soft Pink
      {
        value: 'Brown',
        translationKey: 'SF_COLOR_BROWN' as keyof typeof T,
        colorHex: '#BCAAA4',
      }, // Light/Muted Brown
      {
        value: 'Gray',
        translationKey: 'SF_COLOR_GRAY' as keyof typeof T,
        colorHex: '#BDBDBD',
      }, // Medium Gray
    ];

    this.availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => ({
      value: size,
      translationKey: `SF_SIZE_${size.toUpperCase()}` as keyof typeof T,
    }));

    this.availablePriceRanges = [
      {
        id: '0-20',
        labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_0_20',
        min: 0,
        max: 20,
      },
      {
        id: '20-50',
        labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_20_50',
        min: 20,
        max: 50,
      },
      {
        id: '50-100',
        labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_50_100',
        min: 50,
        max: 100,
      },
      {
        id: '100-Infinity',
        labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_100_PLUS',
        min: 100,
      },
    ];
  }

  ngOnInit(): void {
    this.initializeFromQueryParams();

    const productResponse$ = this.combineProductStreams().pipe(
      takeUntil(this.destroy$)
    );

    this.products$ = productResponse$.pipe(
      map((response) => response?.products || [])
    );
    this.totalProducts$ = productResponse$.pipe(
      map((response) => response?.total || 0)
    );

    // Update signals when Observables emit
    this.totalProducts$.pipe(takeUntil(this.destroy$)).subscribe((total) => {
      this.totalProductsSignal.set(total);
    });
    this.page$.pipe(takeUntil(this.destroy$)).subscribe((page) => {
      this.pageSignal.set(page);
    });
    this.sort$.pipe(takeUntil(this.destroy$)).subscribe((sort) => {
      this.sortSignal.set(sort);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private combineProductStreams() {
    return rxjsCombineLatest([
      this.categoryId$,
      this.filters$,
      this.sort$,
      this.page$,
    ]).pipe(
      tap(([categoryId, filters, sort, page]) => {
        // Centralized URL synchronization - ensures single source of truth
        this.updateUrlQueryParams(filters, sort, page);
      }),
      switchMap(([categoryId, filters, sort, page]) => {
        const params: ProductQueryParams = {
          sort: sort,
          page: page,
          limit: this.itemsPerPage,
          ...this.mapFiltersToApiParams(filters),
        };
        // Only add category_id if it exists
        if (categoryId !== undefined && categoryId !== null) {
          params.category_id = categoryId;
        }
        // Remove null/undefined params before sending
        Object.keys(params).forEach((key) => {
          const paramKey = key as keyof ProductQueryParams;
          if (params[paramKey] == null) {
            delete params[paramKey];
          }
        });
        return this.apiService.getProducts(params);
      })
    );
  }

  initializeFromQueryParams(): void {
    const queryParams = this.queryParams;
    const initialFilters: Filters = {};

    // Price ranges from query params (e.g., price_ranges=0-20,20-50)
    if (queryParams['price_ranges']) {
      const priceRangeIds = queryParams['price_ranges'].split(',');
      priceRangeIds.forEach((id: string) => {
        if (this.availablePriceRanges.some((r) => r.id === id)) {
          this.selectedPriceRanges[id] = true;
        }
      });
      // Derive price_min and price_max from selectedPriceRanges for initialFilters
      const activePriceRangeIds = Object.keys(this.selectedPriceRanges).filter(
        (id) => this.selectedPriceRanges[id]
      );
      const priceFilter = this.buildPriceFilterFromRanges(activePriceRangeIds);
      Object.assign(initialFilters, priceFilter);
    } else {
      // Legacy support for price_min/price_max if price_ranges is not present
      if (queryParams['price_min'])
        initialFilters.price_min = +queryParams['price_min'];
      if (queryParams['price_max'])
        initialFilters.price_max = +queryParams['price_max'];
      // Try to map back to a selectedPriceRange if only min/max are provided
      const matchedRange = this.availablePriceRanges.find(
        (r) =>
          r.min === initialFilters.price_min &&
          r.max === initialFilters.price_max
      );
      if (matchedRange) {
        this.selectedPriceRanges[matchedRange.id] = true;
      } else if (
        initialFilters.price_min === 100 &&
        initialFilters.price_max === undefined
      ) {
        const plusRange = this.availablePriceRanges.find(
          (r) => r.id === '100-Infinity'
        );
        if (plusRange) this.selectedPriceRanges[plusRange.id] = true;
      }
    }

    if (queryParams['tags'])
      initialFilters.tags = queryParams['tags'].split(',');
    if (queryParams['colors'])
      initialFilters.colors = queryParams['colors'].split(',');
    if (queryParams['sizes'])
      initialFilters.sizes = queryParams['sizes'].split(',');

    // Initialize local state for filter inputs based on query params
    this.selectedTags = (initialFilters.tags || []).reduce(
      (acc, tag) => {
        acc[tag] = true;
        return acc;
      },
      {} as { [key: string]: boolean }
    );
    this.selectedColors = (initialFilters.colors || []).reduce(
      (acc, color) => {
        acc[color] = true;
        return acc;
      },
      {} as { [key: string]: boolean }
    );
    this.selectedSizes = (initialFilters.sizes || []).reduce(
      (acc, size) => {
        acc[size] = true;
        return acc;
      },
      {} as { [key: string]: boolean }
    );

    this.filtersSubject.next(initialFilters);
    this.sortSubject.next(queryParams['sort'] || 'newest');
    this.pageSubject.next(queryParams['page'] ? +queryParams['page'] : 1);
  }

  applyFilters(): void {
    const newFilters: Filters = {};

    // Price Range Logic from Checkboxes
    const activePriceRangeIds = Object.keys(this.selectedPriceRanges).filter(
      (id) => this.selectedPriceRanges[id]
    );
    const priceFilter = this.buildPriceFilterFromRanges(activePriceRangeIds);
    Object.assign(newFilters, priceFilter);

    // Tags Logic
    const activeTags = Object.keys(this.selectedTags).filter(
      (tag) => this.selectedTags[tag]
    );
    if (activeTags.length > 0) {
      newFilters.tags = activeTags;
    }

    // Colors Logic
    const activeColors = Object.keys(this.selectedColors).filter(
      (color) => this.selectedColors[color]
    );
    if (activeColors.length > 0) {
      newFilters.colors = activeColors;
    }

    // Sizes Logic
    const activeSizes = Object.keys(this.selectedSizes).filter(
      (size) => this.selectedSizes[size]
    );
    if (activeSizes.length > 0) {
      newFilters.sizes = activeSizes;
    }

    this.filtersSubject.next(newFilters);
    this.pageSubject.next(1); // Reset page on filter change
    // URL sync is now handled centrally in combineProductStreams()
  }

  private buildPriceFilterFromRanges(
    selectedRangeIds: string[]
  ): Pick<Filters, 'price_min' | 'price_max'> {
    const activeRanges = this.availablePriceRanges.filter((r) =>
      selectedRangeIds.includes(r.id)
    );
    if (!activeRanges.length) return {};

    const price_min = Math.min(...activeRanges.map((r) => r.min ?? 0));
    const hasInfinity = activeRanges.some((r) => r.max === undefined);
    const maxValues = activeRanges
      .map((r) => r.max)
      .filter((v): v is number => v !== undefined);

    return {
      price_min,
      price_max: hasInfinity ? undefined : Math.max(...maxValues),
    };
  }

  clearFilters(): void {
    this.selectedPriceRanges = {};
    this.selectedTags = {};
    this.selectedColors = {};
    this.selectedSizes = {};
    this.filtersSubject.next({});
    this.pageSubject.next(1);
    // URL sync is now handled centrally in combineProductStreams()
  }

  onSortChange(newValue: string): void {
    this.sortSubject.next(newValue);
    this.pageSubject.next(1);
    // URL sync is now handled centrally in combineProductStreams()
  }

  onPageChange(page: number): void {
    this.pageSubject.next(page);
    // URL sync is now handled centrally in combineProductStreams()
  }

  private mapFiltersToApiParams(filters: Filters): Partial<ProductQueryParams> {
    const apiParams: Partial<ProductQueryParams> = {};
    if (filters.price_min !== undefined)
      apiParams.price_min = filters.price_min;
    if (filters.price_max !== undefined)
      apiParams.price_max = filters.price_max;

    if (filters.tags && filters.tags.length > 0)
      apiParams.tags = filters.tags.join(',');
    if (filters.colors && filters.colors.length > 0)
      apiParams.colors = filters.colors.join(',');
    if (filters.sizes && filters.sizes.length > 0)
      apiParams.sizes = filters.sizes.join(',');
    return apiParams;
  }

  private updateUrlQueryParams(
    filters: Filters,
    sort: string,
    page: number
  ): void {
    const queryParams: Params = {};

    if (sort !== 'newest') {
      queryParams['sort'] = sort;
    }
    if (page > 1) {
      queryParams['page'] = page;
    }

    // Query params for price ranges
    const activePriceRangeIds = Object.keys(this.selectedPriceRanges).filter(
      (id) => this.selectedPriceRanges[id]
    );
    if (activePriceRangeIds.length > 0) {
      queryParams['price_ranges'] = activePriceRangeIds.join(',');
    } else {
      // Remove legacy price_min/price_max if no ranges are selected
      delete queryParams['price_min'];
      delete queryParams['price_max'];
    }

    if (filters.tags && filters.tags.length > 0) {
      queryParams['tags'] = filters.tags.join(',');
    }
    if (filters.colors && filters.colors.length > 0) {
      queryParams['colors'] = filters.colors.join(',');
    }
    if (filters.sizes && filters.sizes.length > 0) {
      queryParams['sizes'] = filters.sizes.join(',');
    }

    this.router.navigate([], {
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  toggleFilterSection(section: string): void {
    if (this.filterSectionOpenState.hasOwnProperty(section)) {
      this.filterSectionOpenState[section] =
        !this.filterSectionOpenState[section];
    }
  }

  isFilterSectionOpen(section: string): boolean {
    return !!this.filterSectionOpenState[section];
  }

  toggleMobileFilters(): void {
    this.isMobileFiltersVisible = !this.isMobileFiltersVisible;
  }

  toggleSortDropdown(): void {
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
  }

  selectSortOption(value: string): void {
    this.onSortChange(value);
    this.isSortDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!event.target) {
      return;
    }

    // Handle mobile filter close on click outside
    if (this.isMobileFiltersVisible) {
      const clickedInsideButton = this.filterButton?.nativeElement?.contains(
        event.target
      );
      if (!clickedInsideButton) {
        this.isMobileFiltersVisible = false;
      }
    }

    // Handle sort dropdown close on click outside
    if (this.isSortDropdownOpen) {
      const clickedInsideDropdown = this.sortDropdown?.nativeElement?.contains(
        event.target
      );
      if (!clickedInsideDropdown) {
        this.isSortDropdownOpen = false;
      }
    }
  }

  onAddToCart(product: Product): void {
    if (!product || !product.id) {
      console.error('Invalid product data received for AddToCart:', product);
      this.notificationService.showError(
        this.i18nService.translate(
          this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_ERROR_NOTIFICATION
        )
      );
      return;
    }

    this.cartService
      .addItem(product)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            this.i18nService.translate(
              this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_SUCCESS_NOTIFICATION,
              1,
              product.name
            )
          );
          this.addToCart.emit(product);
        },
        error: (error: any) => {
          console.error('Error adding product to cart:', error);
          this.notificationService.showError(
            this.i18nService.translate(
              this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_ERROR_NOTIFICATION
            )
          );
        },
      });
  }

  trackByPageNumber(index: number, pageNum: number): number {
    return pageNum;
  }
}
