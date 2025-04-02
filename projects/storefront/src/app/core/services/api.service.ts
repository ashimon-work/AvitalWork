import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Product } from '@shared-types'; // Import shared interfaces

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = '/api'; // Assuming API is proxied or on the same domain

  constructor() {}

  getFeaturedCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/featured`);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/featured`);
  }

  getCategoryDetails(categoryId: string): Observable<Category | null> {
    // Return null or throw error if category not found by API?
    // Current implementation assumes API returns 404, which HttpClient handles.
    // Consider adding catchError operator if specific handling is needed.
    return this.http.get<Category>(`${this.apiUrl}/categories/${categoryId}`);
  }

  // Method to fetch products, potentially filtered, sorted, and paginated
  getProducts(params: any): Observable<{ products: Product[], total: number }> {
    let httpParams = new HttpParams();
    // Build HttpParams from the params object
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    // Assuming the API returns an object like { products: Product[], total: number }
    return this.http.get<{ products: Product[], total: number }>(`${this.apiUrl}/products`, { params: httpParams });
  }

  // Method for product search
  searchProducts(query: string): Observable<Product[]> { // Assuming API returns just an array for basic search
    const params = new HttpParams().set('q', query);
    // Assuming the backend search endpoint is /api/search
    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params });
  }

  // Method to fetch details for a single product
  getProductDetails(productId: string): Observable<Product> {
    // Assuming API returns 404 if not found, handled by HttpClient
    return this.http.get<Product>(`${this.apiUrl}/products/${productId}`);
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

