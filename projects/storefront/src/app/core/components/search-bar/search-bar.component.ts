import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { Router, RouterLink } from '@angular/router'; // Import Router and RouterLink
import { ApiService } from '../../services/api.service'; // Import ApiService
import { StoreContextService } from '../../services/store-context.service'; // Import StoreContextService
import { Product } from '@shared-types';
import { Subject, Observable, of, combineLatest, withLatestFrom } from 'rxjs';
import {
  debounceTime, distinctUntilChanged, switchMap, catchError, tap, filter, map // Import map
} from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Add FormsModule
    RouterLink   // Add RouterLink
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit {
  searchQuery: string = '';
  // Can hold either Product[] or StoreEntity[] (or a common suggestion type)
  searchResults$: Observable<any[]> = of([]);
  showSuggestions: boolean = false;
  currentStoreSlug$: Observable<string | null>; // Add slug observable

  private searchTerms = new Subject<string>();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private storeContext: StoreContextService
  ) {
    this.currentStoreSlug$ = this.storeContext.currentStoreSlug$; // Initialize slug observable
  }

  // Push a search term into the observable stream.
  search(term: string): void {
    console.log(`[SearchBar] search() called with term: "${term}"`); // Log input event
    // Only search if term is long enough (as per plan)
    if (term.length >= 3) {
      console.log(`[SearchBar] Term "${term}" is >= 3 chars, pushing to searchTerms.`); // Log term push
      this.searchTerms.next(term);
      this.showSuggestions = true;
    } else {
      // Ensure we are NOT reassigning searchResults$ here.
      // Rely on showSuggestions to hide the list.
      this.showSuggestions = false;
    }
  }

  ngOnInit(): void {
    console.log('[SearchBar] ngOnInit: Setting up searchResults$ pipe.'); // Log ngOnInit execution
    this.searchResults$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // Combine with the latest store slug to decide which API to call
      withLatestFrom(this.storeContext.currentStoreSlug$),
      switchMap(([term, slug]) => {
        if (slug) {
          // Store context exists: Search for products within the store
          console.log(`[SearchBar] Pipe: switchMap: Searching PRODUCTS for term "${term}" in store "${slug}"`);
          return this.apiService.getSearchSuggestions(term).pipe(
            // Add a flag or transform results if needed to distinguish them in the template
            map(results => results.map(r => ({ ...r, resultType: 'product' })))
          );
        } else {
          // No store context: Search for stores globally
          console.log(`[SearchBar] Pipe: switchMap: Searching STORES for term "${term}"`);
          return this.apiService.searchStores(term).pipe(
             // Add a flag or transform results
            map(results => results.map(r => ({ ...r, resultType: 'store' })))
          );
        }
      }),
      // Handle errors from either API call
      catchError(error => {
        console.error('[SearchBar] Pipe: Search API error:', error.message || error);
        this.showSuggestions = false;
        return of([]); // Return empty array on error
      })
    );
  }

  // Method to hide suggestions when input loses focus (with a small delay)
  hideSuggestions(): void {
    // Use setTimeout to allow clicking on a suggestion link before hiding
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200); // Adjust delay as needed
  }

  // Method to handle selecting any suggestion (product or store)
  selectSuggestion(suggestion: any): void {
    console.log('Selected suggestion:', suggestion);
    if (suggestion.resultType === 'product') {
      const currentSlug = this.storeContext.getCurrentStoreSlug();
      if (currentSlug && suggestion.id) {
        this.router.navigate(['/', currentSlug, 'product', suggestion.id]);
      } else {
        console.error('Cannot navigate to product suggestion, missing slug or product ID');
      }
    } else if (suggestion.resultType === 'store') {
      if (suggestion.slug) {
        this.router.navigate(['/', suggestion.slug]); // Navigate to store root
      } else {
         console.error('Cannot navigate to store suggestion, missing store slug');
      }
    } else {
       console.error('Unknown suggestion type selected:', suggestion);
    }

    this.searchQuery = ''; // Clear search bar
    this.showSuggestions = false; // Hide suggestions after selection
  }

  // Method to handle submitting the full search query
  // Decide whether to search products or stores based on context
  submitSearch(): void {
    const term = this.searchQuery.trim();
    if (!term) return;

    const currentSlug = this.storeContext.getCurrentStoreSlug();
    console.log(`Submitting search for "${term}" with slug: ${currentSlug}`);

    if (currentSlug) {
      // Navigate to product search results page within the store
      this.router.navigate(['/', currentSlug, 'search'], { queryParams: { q: term } });
      // TODO: Implement Product Search Results Page at '/:storeSlug/search' route
    } else {
      // Navigate to a global store search results page (or handle differently)
      // For now, let's just log it, as a dedicated page might be needed
      console.log('TODO: Implement global store search results page/handling for term:', term);
      // Alternatively, could perform the store search here and display results inline,
      // similar to the 404 page, but that might clutter the header.
      // Let's stick to navigation for now, assuming a results page will exist.
      // this.router.navigate(['/stores/search'], { queryParams: { q: term } }); // Example route
    }
    this.showSuggestions = false; // Hide suggestions after submitting
  }
}

