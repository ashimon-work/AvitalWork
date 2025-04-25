import { Component, inject, OnInit } from '@angular/core'; // Import OnInit
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs'; // Import BehaviorSubject, Subject
import { catchError, tap, map, startWith, debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators'; // Import necessary RxJS operators
import { StoreContextService } from '../../services/store-context.service';
import { ApiService } from '../../services/api.service';

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

  // Use a local subject to manage the slug specifically for this component
  private slugSubject = new BehaviorSubject<string | null>(null);
  currentStoreSlug$: Observable<string | null> = this.slugSubject.asObservable();

  searchQuery: string = '';
  suggestedLinks$: Observable<{ name: string; path: string; }[] | null> | undefined;
  storeSearchResults$: Observable<any[]> = of([]); // Initialize store search results
  private storeSearchTerms = new Subject<string>(); // Subject to handle search term input
  constructor() { }

  ngOnInit(): void {
    // Directly use the slug from the context service. The resolver handles invalid initial slugs.
    this.storeContextService.currentStoreSlug$.subscribe(slugFromContext => {
      this.slugSubject.next(slugFromContext); // Update local subject for template binding

      // Fetch suggested links only if we are in a valid store context
      if (slugFromContext) {
        this.fetchSuggestedLinks(slugFromContext);
      } else {
        this.suggestedLinks$ = of(null); // No suggestions if no store context
      }
    });

    // Setup reactive store search
    this.setupStoreSearch();
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

  // Renamed from onSearch
  onProductSearch(): void {
    // Use the slug determined by this component
    const currentSlug = this.slugSubject.value;
    if (this.searchQuery.trim() && currentSlug) {
      console.log(`Initiating product search within store ${currentSlug} for: ${this.searchQuery.trim()}`);
      // Navigate to the store-specific search results page
      this.router.navigate(['/', currentSlug, 'search'], { queryParams: { q: this.searchQuery.trim() } });
      // TODO: Implement the actual search results page and route
    } else {
      console.log('Product search query is empty or store slug is missing.');
    }
  }

  // Method to push search term into the Subject
  searchStores(term: string): void {
    this.storeSearchTerms.next(term);
  }

  private setupStoreSearch(): void {
    this.storeSearchResults$ = this.storeSearchTerms.pipe(
      // Wait 300ms after each keystroke before considering the term
      debounceTime(300),
      // Ignore new term if same as previous term
      distinctUntilChanged(),
      // Filter out terms less than 2 characters
      filter((term: string) => term.trim().length >= 2),
      // Switch to new search observable each time the term changes
      switchMap((term: string) => {
        console.log(`Initiating reactive store search for: ${term.trim()}`);
        return this.apiService.searchStores(term.trim()).pipe(
          tap(results => console.log('Store search results:', results)),
          catchError(error => {
            console.error('Error fetching store search results:', error);
            return of([]); // Return empty array on error
          })
        );
      }),
      // Start with empty array if the initial term (or filtered term) is too short
      startWith([])
    );
  }

  // Optional: Clear search results if input is cleared manually
  onSearchQueryChange(query: string): void {
    this.searchQuery = query; // Keep ngModel updated if needed elsewhere
    this.searchStores(query); // Push the new query to the subject
    if (query.trim().length < 2) {
      // If the query becomes too short, we could manually reset,
      // but the startWith([]) in the pipe should handle this when the filter kicks in.
      // Alternatively, push an empty array directly:
      // this.storeSearchResults$ = of([]); // Uncomment if startWith doesn't cover all edge cases
    }
  }
}