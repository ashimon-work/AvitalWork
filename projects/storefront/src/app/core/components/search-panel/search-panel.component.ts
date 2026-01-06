import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { Subject, of, Subscription, fromEvent, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, filter, takeUntil, map } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { StoreContextService } from '../../services/store-context.service';
import { SearchPanelService } from '../../services/search-panel.service';
import { Product, Category } from '@shared-types';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    CurrencyPipe,
    TranslatePipe
  ],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss'
})
export class SearchPanelComponent implements OnInit, OnDestroy {
  public tKeys = T;
  searchQuery: string = '';
  filteredCategories: Category[] = [];
  filteredProducts: Product[] = [];
  isOpen: boolean = false;

  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();
  private subscriptions = new Subscription();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private storeContext: StoreContextService,
    private searchPanelService: SearchPanelService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Subscribe to search results
    const searchResults$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (!term || term.length < 2) {
          return of({ categories: [], products: [] });
        }
        return this.apiService.getSearchSuggestions(term).pipe(
          map((products) => {
            // Filter products based on search query
            const filteredProducts = products.filter(p =>
              p.name.toLowerCase().includes(term.toLowerCase())
            );
            return { categories: [], products: filteredProducts };
          }),
          catchError((error) => {
            console.error('[SearchPanel] Error fetching search results:', error);
            return of({ categories: [], products: [] });
          })
        );
      }),
      takeUntil(this.destroy$)
    );

    this.subscriptions.add(
      searchResults$.subscribe((results) => {
        this.filteredCategories = results.categories;
        this.filteredProducts = results.products;
      })
    );

    // Handle body scroll lock when panel opens/closes
    this.subscriptions.add(
      this.searchPanelService.isOpen$.subscribe((isOpen) => {
        console.log('[SearchPanelComponent] isOpen changed to:', isOpen);
        this.isOpen = isOpen;
        if (isOpen) {
          document.body.style.overflow = 'hidden';
          // Auto-focus input when panel opens
          setTimeout(() => {
            this.searchInput?.nativeElement.focus();
          }, 100);
        } else {
          document.body.style.overflow = 'unset';
          this.searchQuery = '';
          this.filteredCategories = [];
          this.filteredProducts = [];
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    document.body.style.overflow = 'unset';
  }

  onClose(): void {
    this.searchPanelService.close();
  }

  onSearchQueryChanged(query: string): void {
    this.searchQuery = query;
    const trimmedQuery = query.trim();
    this.searchTerms.next(trimmedQuery);

    if (trimmedQuery.length < 2) {
      this.filteredCategories = [];
      this.filteredProducts = [];
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchTerms.next('');
    this.filteredCategories = [];
    this.filteredProducts = [];
    this.searchInput?.nativeElement.focus();
  }

  async navigateToCategory(category: Category): Promise<void> {
    const storeSlug = await firstValueFrom(this.storeContext.currentStoreSlug$);
    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'category', category.id]);
    } else {
      this.router.navigate(['/category', category.id]);
    }
    this.onClose();
  }

  async navigateToProduct(product: Product): Promise<void> {
    const storeSlug = await firstValueFrom(this.storeContext.currentStoreSlug$);
    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'product', product.id]);
    } else {
      this.router.navigate(['/product', product.id]);
    }
    this.onClose();
  }

  async submitSearch(): Promise<void> {
    const term = this.searchQuery.trim();
    if (!term) return;

    const storeSlug = await firstValueFrom(this.storeContext.currentStoreSlug$);

    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'search'], { queryParams: { q: term } });
    } else {
      this.router.navigate(['/search'], { queryParams: { q: term, global: 'true' } });
    }
    this.onClose();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.searchQuery.trim().length > 0) {
      event.preventDefault();
      this.submitSearch();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onClose();
    }
  }
}
