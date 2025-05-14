import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // Import Location
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { catchError, tap, map, startWith, debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { StoreContextService } from '../../services/store-context.service';
import { ApiService } from '../../services/api.service';
import { Product } from '@shared-types'; // Import Product type

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss']
})
export class NotFoundPageComponent implements OnInit {
  private storeContextService = inject(StoreContextService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private location = inject(Location); // Inject Location

  // Use a local subject to manage the slug specifically for this component
  private slugSubject = new BehaviorSubject<string | null>(null);
  currentStoreSlug$: Observable<string | null> = this.slugSubject.asObservable();

  searchQuery: string = ''; // For store search
  productSearchInput: string = ''; // For product search input
  suggestedLinks$: Observable<{ name: string; path: string; }[] | null> | undefined;
  storeSearchResults$: Observable<any[]> = of([]);
  private storeSearchTerms = new Subject<string>();

  // For Product Suggestions
  productSuggestions$: Observable<Product[]> = of([]);
  private productSearchTerms = new Subject<string>();

  constructor() { }

  ngOnInit(): void {
    // Log the 404 event
    // Using this.router.url as it reflects the URL that Angular tried to navigate to.
    const path = this.router.url;
    console.warn(`404 Not Found: ${path}`);
    // Optional: Call a backend logging service here if available
    // Example: this.apiService.logError({ event: '404', path: path, timestamp: new Date() }).subscribe();

    this.storeContextService.currentStoreSlug$.subscribe(slugFromContext => {
      this.slugSubject.next(slugFromContext);

      if (slugFromContext) {
        this.fetchSuggestedLinks(slugFromContext);
      } else {
        this.suggestedLinks$ = of(null);
      }
    });

    this.setupStoreSearch();
    this.setupProductSuggestions(); // Setup product suggestions
  }

  // Pass slug explicitly
  fetchSuggestedLinks(storeSlug: string): void {
    console.log(`Fetching suggested links for store: ${storeSlug}`);
    // Note: ApiService.getPopularNavigation already uses the context service,
    // but passing it here ensures we use the slug determined by *this* component.
    // We might need to modify ApiService method to accept an optional slug override.
    // For now, let's assume ApiService will pick up the correct context eventually,
    // or refactor ApiService later if needed.
    this.suggestedLinks$ = this.apiService.getPopularNavigation().pipe(
      tap(links => console.log('Fetched suggested links:', links)),
      catchError(error => {
        console.error('Error fetching suggested links:', error);
        return of(null);
      })
    );
  }

  // Renamed to onProductSearchSubmit for clarity, handles form submission
  onProductSearchSubmit(): void {
    const currentSlug = this.slugSubject.value;
    if (this.productSearchInput.trim() && currentSlug) {
      console.log(`Initiating product search page navigation for store ${currentSlug} with query: ${this.productSearchInput.trim()}`);
      this.router.navigate(['/', currentSlug, 'search'], { queryParams: { q: this.productSearchInput.trim() } });
      this.productSearchInput = ''; // Clear input after navigation
      this.productSearchTerms.next(''); // Clear suggestions stream
      this.productSuggestions$ = of([]); // Explicitly clear suggestions
    } else {
      console.log('Product search query is empty or store slug is missing for page navigation.');
    }
  }

  // Method to push search term into the Subject for store search
  searchStores(term: string): void {
    this.storeSearchTerms.next(term);
  }

  private setupStoreSearch(): void {
    this.storeSearchResults$ = this.storeSearchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((term: string) => term.trim().length >= 2),
      switchMap((term: string) => {
        console.log(`Initiating reactive store search for: ${term.trim()}`);
        return this.apiService.searchStores(term.trim()).pipe(
          tap(results => console.log('Store search results:', results)),
          catchError(error => {
            console.error('Error fetching store search results:', error);
            return of([]);
          })
        );
      }),
      startWith([])
    );
  }

  // For store search input changes - Renamed for clarity
  onStoreSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.searchStores(query);
    // The pipe's filter and startWith handle clearing results for short queries
  }

  // --- Product Suggestion Logic ---
  onProductSearchInputChange(query: string): void {
    this.productSearchInput = query; // Update the dedicated model for product search
    const currentSlug = this.slugSubject.value;
    // Only trigger search if in store context and query is long enough
    if (currentSlug && query.trim().length >= 2) {
      this.productSearchTerms.next(query);
    } else {
      this.productSuggestions$ = of([]); // Clear suggestions if query too short or no store context
    }
  }

  private setupProductSuggestions(): void {
    this.productSuggestions$ = this.productSearchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // Filter is effectively handled in onProductSearchInputChange before nexting,
      // but an additional safeguard here doesn't hurt.
      filter(term => term.trim().length >= 2),
      switchMap(term => {
        const currentSlug = this.slugSubject.value;
        if (!currentSlug) { // Should be caught by the input change handler, but good to double check
          return of([]);
        }
        // ApiService.getSearchSuggestions uses the store slug from StoreContextService
        // or can be modified to accept it if needed.
        // Current ApiService.getSearchSuggestions already handles storeSlug internally.
        return this.apiService.getSearchSuggestions(term.trim()).pipe(
          tap(suggestions => console.log('Product suggestions received:', suggestions)),
          catchError(error => {
            console.error('Error fetching product suggestions:', error);
            return of([]);
          })
        );
      }),
      startWith([]) // Initialize with empty array
    );
  }

  selectProductSuggestion(product: Product): void {
    const currentSlug = this.slugSubject.value;
    if (currentSlug && product.id) { // Ensure product has an id for navigation
      console.log(`Navigating to product: ${product.name} (id: ${product.id}) in store ${currentSlug}`);
      this.router.navigate(['/', currentSlug, 'product', product.id]);
      this.productSearchInput = ''; // Clear search input
      this.productSearchTerms.next(''); // Clear suggestions stream
      this.productSuggestions$ = of([]); // Explicitly clear suggestions
    } else {
      console.warn('Cannot navigate to product suggestion. Store slug or product.id missing.', { currentSlug, product });
    }
  }
}