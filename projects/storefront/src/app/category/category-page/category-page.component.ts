// import {
//   Component,
//   OnInit,
//   OnDestroy,
//   HostListener,
//   ViewChild,
//   ElementRef,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router, RouterLink, Params } from '@angular/router';
// import {
//   Observable,
//   Subject,
//   switchMap,
//   tap,
//   map,
//   takeUntil,
//   combineLatest,
//   BehaviorSubject,
// } from 'rxjs';

// import { Category, Product } from '@shared-types';
// import { T, TranslatePipe } from '@shared/i18n';

// import { ApiService } from '../../core/services/api.service';
// import { StoreContextService } from '../../core/services/store-context.service';
// import { CartService } from '../../core/services/cart.service';

// import { ProductListingComponent } from '../../shared/components/product-listing/product-listing.component';
// import { CategoryNavigationComponent } from '../../shared/components/category-navigation/category-navigation.component';
// import { FeaturedProductCardComponent } from '../../shared/components/featured-product-card/featured-product-card.component';

// interface Filters {
//   price_min?: number;
//   price_max?: number;
//   tags?: string[];
//   colors?: string[];
//   sizes?: string[];
// }

// interface DisplayableFilterItem {
//   value: string;
//   translationKey: keyof typeof T;
// }

// interface DisplayableColorItem extends DisplayableFilterItem {
//   colorHex: string;
// }

// interface PriceRangeFilterItem {
//   id: string;
//   labelTranslationKey: keyof typeof T;
//   min?: number;
//   max?: number;
// }

// @Component({
//   selector: 'app-category-page',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterLink,
//     TranslatePipe,
//     ProductListingComponent,
//     CategoryNavigationComponent,
//     FeaturedProductCardComponent,
//   ],
//   templateUrl: './category-page.component.html',
//   styleUrl: './category-page.component.scss',
// })
// export class CategoryPageComponent implements OnInit, OnDestroy {
//   public tKeys = T;

//   category$!: Observable<Category | null>;
//   currentCategoryId$!: Observable<string>;
//   currentStoreSlug$: Observable<string | null>;
//   queryParams$!: Observable<Params>;

//   products$!: Observable<Product[]>;
//   totalProducts$!: Observable<number>;

//   private destroy$ = new Subject<void>();

//   private filtersSubject = new BehaviorSubject<Filters>({});
//   private sortSubject = new BehaviorSubject<string>('newest');
//   private pageSubject = new BehaviorSubject<number>(1);

//   filters$ = this.filtersSubject.asObservable();
//   sort$ = this.sortSubject.asObservable();
//   page$ = this.pageSubject.asObservable();

//   readonly itemsPerPage = 12;

//   selectedPriceRanges: Record<string, boolean> = {};
//   selectedTags: Record<string, boolean> = {};
//   selectedColors: Record<string, boolean> = {};
//   selectedSizes: Record<string, boolean> = {};

//   isMobileFiltersVisible = false;

//   availableTags: DisplayableFilterItem[];
//   availableColors: DisplayableColorItem[];
//   availableSizes: DisplayableFilterItem[];
//   availablePriceRanges: PriceRangeFilterItem[];

//   filterSectionOpenState: Record<string, boolean> = {
//     price: true,
//     tags: true,
//     colors: true,
//     sizes: true,
//   };

//   @ViewChild('filterButton') filterButton!: ElementRef;
//   @ViewChild('mobileFilterOverlay') mobileFilterOverlay!: ElementRef;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private apiService: ApiService,
//     private storeContext: StoreContextService,
//     private cartService: CartService
//   ) {
//     this.currentStoreSlug$ = this.storeContext.currentStoreSlug$;

//     this.availableTags = ['New', 'Sale', 'Featured'].map((tag) => ({
//       value: tag,
//       translationKey: `SF_CATEGORY_TAG_${tag.toUpperCase()}` as keyof typeof T,
//     }));

//     this.availableColors = [
//       { value: 'Red', translationKey: 'SF_COLOR_RED', colorHex: '#F28B82' },
//       { value: 'Blue', translationKey: 'SF_COLOR_BLUE', colorHex: '#89B4F8' },
//       { value: 'Green', translationKey: 'SF_COLOR_GREEN', colorHex: '#81C995' },
//       { value: 'Black', translationKey: 'SF_COLOR_BLACK', colorHex: '#5F6368' },
//       { value: 'White', translationKey: 'SF_COLOR_WHITE', colorHex: '#FFFFFF' },
//     ];

//     this.availableSizes = ['XS', 'S', 'M', 'L', 'XL'].map((size) => ({
//       value: size,
//       translationKey: `SF_SIZE_${size}` as keyof typeof T,
//     }));

//     this.availablePriceRanges = [
//       {
//         id: '0-20',
//         labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_0_20',
//         min: 0,
//         max: 20,
//       },
//       {
//         id: '20-50',
//         labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_20_50',
//         min: 20,
//         max: 50,
//       },
//       {
//         id: '50-100',
//         labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_50_100',
//         min: 50,
//         max: 100,
//       },
//       {
//         id: '100+',
//         labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_100_PLUS',
//         min: 100,
//       },
//     ];
//   }

//   ngOnInit(): void {
//     this.currentCategoryId$ = this.route.paramMap.pipe(
//       map((p) => p.get('id')),
//       tap((id) => !id && this.router.navigate(['/'])),
//       map((id) => id!),
//       takeUntil(this.destroy$)
//     );

//     this.category$ = this.currentCategoryId$.pipe(
//       switchMap((id) => this.apiService.getCategoryDetails(id)),
//       tap((c) => !c && this.router.navigate(['/not-found'])),
//       takeUntil(this.destroy$)
//     );

//     const response$ = combineLatest([
//       this.currentCategoryId$,
//       this.filters$,
//       this.sort$,
//       this.page$,
//     ]).pipe(
//       switchMap(([categoryId, filters, sort, page]) =>
//         this.apiService.getProducts({
//           category_id: categoryId,
//           sort,
//           page,
//           limit: this.itemsPerPage,
//           ...this.mapFiltersToApiParams(filters),
//         })
//       ),
//       takeUntil(this.destroy$)
//     );

//     this.products$ = response$.pipe(map((r) => r?.products ?? []));
//     this.totalProducts$ = response$.pipe(map((r) => r?.total ?? 0));
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   onAddToCart(product: Product): void {
//     this.cartService.addItem(product).subscribe();
//   }

//   private mapFiltersToApiParams(filters: Filters): any {
//     const params: any = {};
//     if (filters.price_min != null) params.price_min = filters.price_min;
//     if (filters.price_max != null) params.price_max = filters.price_max;
//     if (filters.tags?.length) params.tags = filters.tags.join(',');
//     if (filters.colors?.length) params.colors = filters.colors.join(',');
//     if (filters.sizes?.length) params.sizes = filters.sizes.join(',');
//     return params;
//   }

//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent): void {
//     if (!this.isMobileFiltersVisible) return;
//     if (
//       !this.filterButton?.nativeElement.contains(event.target) &&
//       !this.mobileFilterOverlay?.nativeElement.contains(event.target)
//     ) {
//       this.isMobileFiltersVisible = false;
//     }
//   }
// }

import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, Params } from '@angular/router';
import {
  Observable,
  Subject,
  switchMap,
  tap,
  map,
  takeUntil,
  combineLatest,
  BehaviorSubject,
} from 'rxjs';

import { Category, Product } from '@shared-types';
import { T, TranslatePipe } from '@shared/i18n';

// import { ApiService } from './core/services/api.service';
// import { CartService } from '../../services/cart.service';

// import { ProductListingComponent } from '../../shared/components/product-listing/product-listing.component';
// import { CategoryNavigationComponent } from '../../shared/components/category-navigation/category-navigation.component';
// import { FeaturedProductCardComponent } from '../../shared/components/featured-product-card/featured-product-card.component';
// import { ProductListingComponent } from '../../shared/components/product-listing/product-listing.component';
// import { CategoryNavigationComponent } from '../../../shared/components/category-navigation/category-navigation.component';
// import { FeaturedProductCardComponent } from '../../../shared/components/featured-product-card/featured-product-card.component';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { CartService } from '../../core/services/cart.service';
import { ProductListingComponent } from '../../shared/components/product-listing/product-listing.component';
import { CategoryNavigationComponent } from '../../shared/components/category-navigation/category-navigation.component';
import { FeaturedProductCardComponent } from '../../shared/components/featured-product-card/featured-product-card.component';

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
  id: string;
  labelTranslationKey: keyof typeof T;
  min?: number;
  max?: number;
}

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    ProductListingComponent,
    CategoryNavigationComponent,
    FeaturedProductCardComponent,
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss',
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  public tKeys = T;

  category$!: Observable<Category | null>;
  currentCategoryId$!: Observable<string>;
  currentStoreSlug$: Observable<string | null>;
  queryParams$!: Observable<Params>;

  products$!: Observable<Product[]>;
  totalProducts$!: Observable<number>;

  private destroy$ = new Subject<void>();

  private filtersSubject = new BehaviorSubject<Filters>({});
  private sortSubject = new BehaviorSubject<string>('newest');
  private pageSubject = new BehaviorSubject<number>(1);

  filters$ = this.filtersSubject.asObservable();
  sort$ = this.sortSubject.asObservable();
  page$ = this.pageSubject.asObservable();

  readonly itemsPerPage = 12;

  selectedPriceRanges: Record<string, boolean> = {};
  selectedTags: Record<string, boolean> = {};
  selectedColors: Record<string, boolean> = {};
  selectedSizes: Record<string, boolean> = {};

  isMobileFiltersVisible = false;

  availableTags: DisplayableFilterItem[];
  availableColors: DisplayableColorItem[];
  availableSizes: DisplayableFilterItem[];
  availablePriceRanges: PriceRangeFilterItem[];

  filterSectionOpenState: Record<string, boolean> = {
    price: true,
    tags: true,
    colors: true,
    sizes: true,
  };

  @ViewChild('filterButton') filterButton!: ElementRef;
  @ViewChild('mobileFilterOverlay') mobileFilterOverlay!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private storeContext: StoreContextService,
    private cartService: CartService
  ) {
    this.currentStoreSlug$ = this.storeContext.currentStoreSlug$;

    this.availableTags = ['New', 'Sale', 'Featured'].map((tag) => ({
      value: tag,
      translationKey: `SF_CATEGORY_TAG_${tag.toUpperCase()}` as keyof typeof T,
    }));

    this.availableColors = [
      { value: 'Red', translationKey: 'SF_COLOR_RED', colorHex: '#F28B82' },
      { value: 'Blue', translationKey: 'SF_COLOR_BLUE', colorHex: '#89B4F8' },
      { value: 'Green', translationKey: 'SF_COLOR_GREEN', colorHex: '#81C995' },
      { value: 'Black', translationKey: 'SF_COLOR_BLACK', colorHex: '#5F6368' },
      { value: 'White', translationKey: 'SF_COLOR_WHITE', colorHex: '#FFFFFF' },
    ];

    this.availableSizes = ['XS', 'S', 'M', 'L', 'XL'].map((size) => ({
      value: size,
      translationKey: `SF_SIZE_${size}` as keyof typeof T,
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
        id: '100+',
        labelTranslationKey: 'SF_CATEGORY_FILTER_PRICE_100_PLUS',
        min: 100,
      },
    ];
  }

  ngOnInit(): void {
    this.currentCategoryId$ = this.route.paramMap.pipe(
      map((p) => p.get('id')),
      tap((id) => !id && this.router.navigate(['/'])),
      map((id) => id!),
      takeUntil(this.destroy$)
    );

    this.category$ = this.currentCategoryId$.pipe(
      switchMap((id) => this.apiService.getCategoryDetails(id)),
      tap((c) => !c && this.router.navigate(['/not-found'])),
      takeUntil(this.destroy$)
    );

    const response$ = combineLatest([
      this.currentCategoryId$,
      this.filters$,
      this.sort$,
      this.page$,
    ]).pipe(
      switchMap(([categoryId, filters, sort, page]) =>
        this.apiService.getProducts({
          category_id: categoryId,
          sort,
          page,
          limit: this.itemsPerPage,
          ...this.mapFiltersToApiParams(filters),
        })
      ),
      takeUntil(this.destroy$)
    );

    this.products$ = response$.pipe(map((r) => r?.products ?? []));
    this.totalProducts$ = response$.pipe(map((r) => r?.total ?? 0));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddToCart(product: Product): void {
    this.cartService.addItem(product).subscribe();
  }

  private mapFiltersToApiParams(filters: Filters): any {
    const params: any = {};
    if (filters.price_min != null) params.price_min = filters.price_min;
    if (filters.price_max != null) params.price_max = filters.price_max;
    if (filters.tags?.length) params.tags = filters.tags.join(',');
    if (filters.colors?.length) params.colors = filters.colors.join(',');
    if (filters.sizes?.length) params.sizes = filters.sizes.join(',');
    return params;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMobileFiltersVisible) return;
    if (
      !this.filterButton?.nativeElement.contains(event.target) &&
      !this.mobileFilterOverlay?.nativeElement.contains(event.target)
    ) {
      this.isMobileFiltersVisible = false;
    }
  }
}
