import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { RouterLink } from '@angular/router'; // For linking suggestions
import { ApiService } from '../../services/api.service'; // Import ApiService
import { Product } from '@shared-types';
import { Subject, Observable, of } from 'rxjs';
import {
  debounceTime, distinctUntilChanged, switchMap, catchError
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
  searchResults$: Observable<Product[]> | undefined;
  showSuggestions: boolean = false;

  private searchTerms = new Subject<string>();

  constructor(private apiService: ApiService) {}

  // Push a search term into the observable stream.
  search(term: string): void {
    // Only search if term is long enough (as per plan)
    if (term.length >= 3) {
      this.searchTerms.next(term);
      this.showSuggestions = true;
    } else {
      this.searchResults$ = of([]); // Clear results if term is too short
      this.showSuggestions = false;
    }
  }

  ngOnInit(): void {
    this.searchResults$ = this.searchTerms.pipe(
      // Wait 200ms after each keystroke before considering the term (as per plan)
      debounceTime(1),

      // Ignore new term if same as previous term
      distinctUntilChanged(),

      // Switch to new search observable each time the term changes
      switchMap((term: string) => this.apiService.searchProducts(term)),

      // Handle errors, e.g., return empty array
      catchError(error => {
        console.error('Search API error:', error);
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

  // Optional: Method to handle selecting a suggestion (e.g., navigate to product)
  selectSuggestion(product: Product): void {
    // Example: Navigate to product page or clear search
    console.log('Selected:', product);
    this.searchQuery = ''; // Clear search bar
    this.showSuggestions = false;
    // this.router.navigate(['/product', product.id]); // Requires Router injection
  }
}

