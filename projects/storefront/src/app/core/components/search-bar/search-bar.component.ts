import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core'; // Added OnDestroy, ViewChild, ElementRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { StoreContextService } from '../../services/store-context.service';
import { Product, Store } from '@shared-types'; // Added Store type
import { Subject, Observable, of, Subscription, fromEvent, firstValueFrom } from 'rxjs'; // Added Subscription, fromEvent, firstValueFrom
import {
  debounceTime, distinctUntilChanged, switchMap, catchError, tap, filter, map, takeUntil, withLatestFrom
} from 'rxjs/operators'; // Added takeUntil and withLatestFrom
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

// Define a type for combined search results
export type SearchResultItem = (Product & { resultType: 'product' }) | (Store & { resultType: 'store' });

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    MatIconModule // Add MatIconModule here
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit, OnDestroy {
  public tKeys = T;
  searchQuery: string = '';
  showSuggestions = false;
  activeSuggestionIndex = -1;
  currentSearchSuggestions: SearchResultItem[] = []; // Use the new combined type

  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();
  private subscriptions = new Subscription();
  public searchInputFocused = false; // Made public

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>; // Uncommented and will use #searchInput in template

  constructor(
    private apiService: ApiService,
    private router: Router,
    private storeContext: StoreContextService,
    private elementRef: ElementRef // Injected ElementRef
  ) {}

  ngOnInit(): void {
    const searchResults$: Observable<SearchResultItem[]> = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      withLatestFrom(this.storeContext.currentStoreSlug$),
      switchMap(([term, storeSlug]) => {
        if (!term || term.length < 3) {
          return of([]);
        }
        if (storeSlug) {
          return this.apiService.getSearchSuggestions(term).pipe(
            map(products => products.map(p => ({ ...p, resultType: 'product' } as SearchResultItem))),
            catchError(error => {
              console.error('[SearchBar] Error fetching product suggestions:', error);
              return of([]);
            })
          );
        } else {
          // If no store slug, perhaps we search globally for stores or offer a different experience.
          // For now, let's assume product search is primary if store context exists.
          // Or, call apiService.searchStores(term) if that's the desired fallback.
          // This part matches the original SearchBarComponent's logic for store search.
           return this.apiService.searchStores(term).pipe(
             map(stores => stores.map(s => ({ ...s, resultType: 'store' } as SearchResultItem))),
             catchError(error => {
               console.error('[SearchBar] Error fetching store suggestions:', error);
               return of([]);
             })
           );
        }
      }),
      takeUntil(this.destroy$)
    );

    this.subscriptions.add(
      searchResults$.subscribe(suggestions => {
        this.currentSearchSuggestions = suggestions;
        this.showSuggestions = this.searchInputFocused && suggestions.length > 0 && this.searchQuery.length >=3;
        this.activeSuggestionIndex = -1;
      })
    );

    // Click outside logic
    fromEvent(document, 'click').pipe(
      filter(event => {
        if (!this.showSuggestions) return false;
        const clickedElement = event.target as HTMLElement;
        // Check if the click is outside the search-bar component itself
        return !this.elementRef.nativeElement.contains(clickedElement);
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.showSuggestions = false;
      this.activeSuggestionIndex = -1;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchQueryChanged(query: string): void {
    this.searchQuery = query; // Keep searchQuery bound for the input field
    const trimmedQuery = query.trim();
    this.searchTerms.next(trimmedQuery);

    if (trimmedQuery.length < 3) {
      this.showSuggestions = false;
      this.currentSearchSuggestions = []; // Clear suggestions immediately
    } else if (this.searchInputFocused) {
        // If query is long enough and input is focused, intent is to show.
        // Actual display depends on currentSearchSuggestions having items.
        this.showSuggestions = true;
    }
     this.activeSuggestionIndex = -1;
  }
  
  onSearchFocus(): void {
    this.searchInputFocused = true;
    if (this.searchQuery.trim().length >= 3 && this.currentSearchSuggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  // hideSuggestions on blur is tricky with click selection. Click-outside is better.
  // public hideSuggestions(): void {
  //   this.searchInputFocused = false;
  //   setTimeout(() => {
  //     if (!this.searchInputFocused) { // Check if focus hasn't returned (e.g., by clicking a suggestion)
  //        this.showSuggestions = false;
  //     }
  //   }, 150);
  // }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchTerms.next(''); // Clear the stream
    this.showSuggestions = false;
    this.activeSuggestionIndex = -1;
    this.currentSearchSuggestions = [];
    // Optionally re-focus input:
    this.searchInput?.nativeElement.focus(); // Use ViewChild reference
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.showSuggestions || this.currentSearchSuggestions.length === 0) {
      if (event.key === 'Enter' && this.searchQuery.trim().length > 0) {
        event.preventDefault();
        this.submitSearch(); // Use existing submitSearch
      }
      return;
    }

    const suggestionsCount = this.currentSearchSuggestions.length;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % suggestionsCount;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSuggestionIndex = (this.activeSuggestionIndex - 1 + suggestionsCount) % suggestionsCount;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.activeSuggestionIndex > -1 && this.activeSuggestionIndex < suggestionsCount) {
        this.selectSuggestion(this.currentSearchSuggestions[this.activeSuggestionIndex]);
      } else {
        this.submitSearch();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.showSuggestions = false;
      this.activeSuggestionIndex = -1;
    }
  }

  // selectSuggestion now takes SearchResultItem
  async selectSuggestion(suggestion: SearchResultItem): Promise<void> {
    this.searchQuery = suggestion.name; // Assuming 'name' is common or handle specific properties
    this.showSuggestions = false;
    this.activeSuggestionIndex = -1;
    
    const storeSlug = await firstValueFrom(this.storeContext.currentStoreSlug$);

    if (suggestion.resultType === 'product') {
      if (storeSlug && suggestion.name) { // Check for name to slugify
         // Products are identified by ID (UUID) in the backend, but routes use slugs.
         // We will generate a slug from the product name for navigation.
        const productSlug = this.slugify(suggestion.name);
        this.router.navigate(['/', storeSlug, 'product', productSlug]);
      } else {
        console.error('Cannot navigate to product suggestion, missing store slug or product name for slug generation.');
      }
    } else if (suggestion.resultType === 'store' && suggestion.slug) {
      this.router.navigate(['/', suggestion.slug]);
    } else {
      console.error('Unknown or incomplete suggestion type selected:', suggestion);
    }
  }
  
  private slugify(text: string): string {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-'); // Replace multiple - with single -
  }

  async submitSearch(): Promise<void> {
    const term = this.searchQuery.trim();
    if (!term) return;

    this.showSuggestions = false;
    const storeSlug = await firstValueFrom(this.storeContext.currentStoreSlug$);

    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'search'], { queryParams: { q: term } });
    } else {
      // For global search, redirect to a generic search page or handle as needed
      this.router.navigate(['/search'], { queryParams: { q: term, global: 'true' } });
      console.log('Performing global search for (stores or all products):', term);
    }
  }
}
