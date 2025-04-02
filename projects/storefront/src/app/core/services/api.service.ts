import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs'; // Import switchMap and take
import { Category, Product } from '@shared-types'; // Import shared interfaces
import { StoreContextService } from './store-context.service'; // Import StoreContextService
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private storeContext = inject(StoreContextService); // Inject StoreContextService
  private apiUrl = '/api'; // Assuming API is proxied or on the same domain

  constructor() {} // Keep constructor if needed for other DI, otherwise remove if only using inject()

  getFeaturedCategories(): Observable<Category[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1), // Take the current value and complete
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<Category[]>(`${this.apiUrl}/categories/featured`, { params });
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
        // Consider adding catchError operator if specific handling is needed.
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
        // Add storeSlug first
        if (storeSlug) {
          httpParams = httpParams.set('storeSlug', storeSlug);
        }
        // Build HttpParams from the queryParams object
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] !== undefined && queryParams[key] !== null) {
            httpParams = httpParams.set(key, queryParams[key].toString());
          }
        });
        // Assuming the API returns an object like { products: Product[], total: number }
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

  // Method to fetch details for a single product
  getProductDetails(productId: string): Observable<Product> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) {
          params = params.set('storeSlug', storeSlug);
        }
        // Assuming API returns 404 if not found, handled by HttpClient
        return this.http.get<Product>(`${this.apiUrl}/products/${productId}`, { params });
      })
    );
  }

  // Method to add item to cart
  addToCart(payload: { productId: string, quantity: number }): Observable<any> { // Assuming API returns new cart state or success
    // The backend endpoint might be POST /api/cart/add as per plan
    return this.http.post(`${this.apiUrl}/cart/add`, payload);
  }

  // Method for newsletter subscription
  subscribeNewsletter(email: string): Observable<any> { // Assuming API returns simple success/error
    // The backend endpoint might be POST /api/newsletter/subscribe as per plan
    return this.http.post(`${this.apiUrl}/newsletter/subscribe`, { email });
  }

  // --- Cart Methods ---

  getCart(): Observable<any> { // Define a proper Cart interface later
    return this.http.get(`${this.apiUrl}/cart`);
  }

  updateCartItemQuantity(productId: string, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cart/${productId}`, { quantity });
  }

  removeCartItem(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${productId}`);
  }

  // --- Auth Methods ---

  register(userData: any): Observable<any> { // Use a proper DTO type later if needed on frontend
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  // Add login method later
}

