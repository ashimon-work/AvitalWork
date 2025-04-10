import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, take, catchError, tap, filter, map } from 'rxjs/operators'; // Add map
import { Category, Product } from '@shared-types';
import { CarouselSlide } from '../../home/components/carousel/carousel.component';
import { StoreContextService } from './store-context.service';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private storeContext = inject(StoreContextService);
  private apiUrl = '/api';

  getFeaturedCategories(): Observable<Category[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        const url = `${this.apiUrl}/categories/featured`;
        console.log(`[ApiService] Fetching featured categories from: ${url} with params:`, params.toString());
        return this.http.get<Category[]>(url, { params }).pipe(
          tap(response => console.log('[ApiService] Featured categories response:', response)),
          catchError(error => {
            console.error('[ApiService] Error fetching featured categories:', error);
            return of([]); // Return empty array on error
          })
        );
      })
    );
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<Product[]>(`${this.apiUrl}/products/featured`, { params });
      })
    );
  }

  getCategoryDetails(categoryId: string): Observable<Category | null> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<Category>(`${this.apiUrl}/categories/${categoryId}`, { params });
      })
    );
  }

  // Method to fetch products, potentially filtered, sorted, and paginated
  getProducts(queryParams: any): Observable<{ products: Product[], total: number }> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let httpParams = new HttpParams();
        if (storeSlug) {
          httpParams = httpParams.set('storeSlug', storeSlug);
        }
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] !== undefined && queryParams[key] !== null) {
            httpParams = httpParams.set(key, queryParams[key].toString());
          }
        });
        return this.http.get<{ products: Product[], total: number }>(`${this.apiUrl}/products`, { params: httpParams });
      })
    );
  }

  // Method for product search
  searchProducts(query: string): Observable<Product[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams().set('q', query);
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        // Assuming the backend search endpoint is /api/search or maybe /api/products?q=...
        // Let's assume /api/products for now, consistent with getProducts
        return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
      })
    );
  }

  getProductDetails(productId: string): Observable<Product> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<Product>(`${this.apiUrl}/products/${productId}`, { params });
      })
    );
  }

  addToCart(payload: { productId: string, quantity: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/add`, payload);
  }

  subscribeNewsletter(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/newsletter/subscribe`, { email });
  }

  getCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart`);
  }

  updateCartItemQuantity(productId: string, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cart/${productId}`, { quantity });
  }

  removeCartItem(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${productId}`);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  getCarouselImages(): Observable<CarouselSlide[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        } else {
          console.error('Store slug is missing when fetching carousel images.');
        }
        console.log('Fetching carousel images from API');
        return this.http.get<CarouselSlide[]>(`${this.apiUrl}/carousel`, { params }).pipe(
          catchError(error => {
            console.error('Error fetching carousel images from API:', error);
            return of([]);
          })
        );
      })
    );
  }

  // Method to fetch popular navigation links (e.g., for 404 page)
  getPopularNavigation(): Observable<{ name: string; path: string; }[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        // Assuming the endpoint is /api/navigation/popular
        const url = `${this.apiUrl}/navigation/popular`;
        console.log(`[ApiService] Fetching popular navigation from: ${url} with params:`, params.toString());
        return this.http.get<{ name: string; path: string; }[]>(url, { params }).pipe(
          tap(response => console.log('[ApiService] Popular navigation response:', response)),
          catchError(error => {
            console.error('[ApiService] Error fetching popular navigation:', error);
            return of([]); // Return empty array on error
          })
        );
      })
    );
  }

  // Method to fetch search suggestions
  getSearchSuggestions(query: string, limit: number = 5): Observable<Product[]> { // Assuming suggestions are Product-like
    // This method is called within the switchMap in SearchBarComponent,
    // so we perform the synchronous check here.
    const currentSlug = this.storeContext.getCurrentStoreSlug();

    if (!currentSlug) {
      const errorMsg = '[ApiService] Cannot fetch search suggestions: Store slug is missing.';
      console.error(errorMsg);
      // Return an observable that immediately throws an error
      return throwError(() => new Error(errorMsg));
    }

    // Slug exists, proceed with the HTTP request
    let params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString())
      .set('storeSlug', currentSlug);

    const url = `${this.apiUrl}/products/suggest`;
    console.log(`[ApiService] Fetching search suggestions from: ${url} with params:`, params.toString());

    // Return the HTTP request observable
    return this.http.get<Product[]>(url, { params }).pipe(
      catchError(error => {
        console.error('[ApiService] Error fetching search suggestions:', error);
        // The component's catchError will handle this, but we return empty array
        // so the stream doesn't break if the component doesn't handle it.
        return of([]);
      })
    );
  }
  // Method to fetch store search results
  searchStores(query: string, limit: number = 10): Observable<any[]> { // Assuming StoreEntity structure for now
    if (!query || query.trim().length < 2) {
      return of([]); // Return empty if query is too short
    }
    let params = new HttpParams()
      .set('q', query.trim())
      .set('limit', limit.toString());

    const url = `${this.apiUrl}/stores/search`;
    console.log(`[ApiService] Fetching store search results from: ${url} with params:`, params.toString());

    return this.http.get<any[]>(url, { params }).pipe(
      catchError(error => {
        console.error('[ApiService] Error fetching store search results:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  // Method to check if a store slug is valid
  checkStoreSlug(slug: string): Observable<boolean> {
    const url = `${this.apiUrl}/stores/slug/${slug}`;
    console.log(`[ApiService] Checking store slug validity: ${url}`);
    return this.http.get<any>(url).pipe(
      map(() => true), // If request succeeds (2xx), slug is valid
      catchError(error => {
        console.warn(`[ApiService] Store slug "${slug}" is invalid or API error:`, error.status);
        return of(false); // If request fails (e.g., 404), slug is invalid
      })
    );
  }
} // End of ApiService class