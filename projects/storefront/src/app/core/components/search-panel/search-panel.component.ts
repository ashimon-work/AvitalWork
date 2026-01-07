import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { Subject, of, Subscription, fromEvent, firstValueFrom } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  filter,
  takeUntil,
  map,
  withLatestFrom,
} from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { StoreContextService } from '../../services/store-context.service';
import { SearchPanelService } from '../../services/search-panel.service';
import { Product, Category, Store } from '@shared-types';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

// Define a type for combined search results
export type SearchResultItem =
  | (Product & { resultType: 'product' })
  | (Store & { resultType: 'store' });

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    CurrencyPipe,
    TranslatePipe,
  ],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss',
})
export class SearchPanelComponent implements OnInit, OnDestroy {
  public tKeys = T;
  searchQuery: string = '';
  searchResults: SearchResultItem[] = [];
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
      withLatestFrom(this.storeContext.currentStoreSlug$),
      switchMap(([term, storeSlug]) => {
        if (!term || term.length < 2) {
          return of([]);
        }
        if (storeSlug) {
          // Search for products when in a store context
          return this.apiService.getSearchSuggestions(term).pipe(
            map((products) =>
              products.map(
                (p) => ({ ...p, resultType: 'product' }) as SearchResultItem
              )
            ),
            catchError((error) => {
              console.error(
                '[SearchPanel] Error fetching product suggestions:',
                error
              );
              return of([]);
            })
          );
        } else {
          // Search for stores when not in a store context
          return this.apiService.searchStores(term).pipe(
            map((stores) =>
              stores.map(
                (s) => ({ ...s, resultType: 'store' }) as SearchResultItem
              )
            ),
            catchError((error) => {
              console.error(
                '[SearchPanel] Error fetching store suggestions:',
                error
              );
              return of([]);
            })
          );
        }
      }),
      takeUntil(this.destroy$)
    );

    this.subscriptions.add(
      searchResults$.subscribe((results) => {
        this.searchResults = results;
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
          this.resetSearchPanel();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    this.resetSearchPanel();
  }

  private resetSearchPanel(): void {
    document.body.style.overflow = 'unset';
    this.searchQuery = '';
    this.searchResults = [];
  }

  onClose(): void {
    this.searchPanelService.close();
  }

  onSearchQueryChanged(query: string): void {
    this.searchQuery = query;
    const trimmedQuery = query.trim();
    this.searchTerms.next(trimmedQuery);

    if (trimmedQuery.length < 2) {
      this.searchResults = [];
    }
  }

  clearSearch(): void {
    this.resetSearchPanel();
    this.searchTerms.next('');
    this.searchInput?.nativeElement.focus();
  }

  async navigateToResult(result: SearchResultItem): Promise<void> {
    const storeSlug = await firstValueFrom(this.storeContext.currentStoreSlug$);

    if (result.resultType === 'product') {
      if (storeSlug && result.id) {
        this.router.navigate(['/', storeSlug, 'product', result.id]);
      } else {
        console.error(
          'Cannot navigate to product result, missing store slug or product ID.'
        );
      }
    } else if (result.resultType === 'store' && result.slug) {
      this.router.navigate(['/', result.slug]);
    } else {
      console.error('Unknown or incomplete result type selected:', result);
    }
    this.onClose();
  }

  async submitSearch(): Promise<void> {
    const term = this.searchQuery.trim();
    if (!term) return;

    const storeSlug = await firstValueFrom(this.storeContext.currentStoreSlug$);

    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'search'], {
        queryParams: { q: term },
      });
    } else {
      this.router.navigate(['/search'], {
        queryParams: { q: term, global: 'true' },
      });
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
