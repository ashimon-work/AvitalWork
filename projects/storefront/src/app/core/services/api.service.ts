import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, take, catchError, tap, filter, map } from 'rxjs/operators'; // Add map
import { Category, Product, Address, Order, User } from '@shared-types'; // Add User type
import { CarouselSlide } from '../../home/components/carousel/carousel.component';
import { StoreContextService } from './store-context.service';
// Define Wishlist types locally if not in shared-types
// Based on backend DTOs
export interface WishlistItemDto {
  id: string; // Wishlist Item ID
  productId: string;
  addedAt: Date;
  product: Partial<Product>; // Use shared Product type
}

export interface WishlistDto {
  id: string; // Wishlist ID
  userId: string;
  storeId: string;
  items: WishlistItemDto[];
  createdAt: Date;
  updatedAt: Date;
}
// Define Address type locally if not in shared-types
export interface AddressDto { // Based on backend DTOs
  id?: string;
  fullName: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
  // Add createdAt/updatedAt if needed
}

// Define Order types locally if not in shared-types
// Based on backend DTOs
export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  variantDetails?: Record<string, any>;
  product?: Partial<Product>; // Use shared Product type
}

export interface OrderDto {
  id: string;
  orderReference: string;
  orderDate: Date;
  status: string; // Use string or specific enum type
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  shippingAddress: AddressDto; // Use AddressDto defined above
  shippingMethod?: string;
  paymentStatus: string; // Use string or specific enum type
  trackingNumber?: string;
  items: OrderItemDto[];
  updatedAt: Date;
}

export interface PaginatedOrders {
    orders: OrderDto[];
    total: number;
}

// DTO for updating personal info
export interface UpdateUserInfoDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  // Add birthday if needed
}

// DTO for changing password
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// DTO for representing a saved payment method (minimal info)
export interface PaymentMethodDto {
  id: string; // Backend ID for the saved method representation
  cardType: string; // e.g., 'Visa', 'Mastercard'
  last4: string; // Last 4 digits
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean; // Optional: if backend supports a default flag
}
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
        return this.http.get<Product[]>(`${this.apiUrl}/products`, { params }).pipe(
          tap(response => console.log('[ApiService] Search products response:', response))
        );
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

  // --- Account Address Methods ---

  getUserAddresses(): Observable<AddressDto[]> {
    // Assumes AuthInterceptor handles token and StoreContextGuard handles store context if needed
    // Backend route is /api/account/addresses
    const url = `${this.apiUrl}/account/addresses`;
    return this.http.get<AddressDto[]>(url).pipe(
      catchError(error => {
        console.error('[ApiService] Error fetching user addresses:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  addUserAddress(addressData: Omit<AddressDto, 'id'>): Observable<AddressDto> {
    const url = `${this.apiUrl}/account/addresses`;
    return this.http.post<AddressDto>(url, addressData).pipe(
      catchError(error => {
        console.error('[ApiService] Error adding user address:', error);
        return throwError(() => error); // Re-throw error for component handling
      })
    );
  }

  updateUserAddress(addressId: string, addressData: Partial<Omit<AddressDto, 'id'>>): Observable<AddressDto> {
    const url = `${this.apiUrl}/account/addresses/${addressId}`;
    return this.http.patch<AddressDto>(url, addressData).pipe(
      catchError(error => {
        console.error(`[ApiService] Error updating user address ${addressId}:`, error);
        return throwError(() => error); // Re-throw error for component handling
      })
    );
  }

  deleteUserAddress(addressId: string): Observable<void> {
    const url = `${this.apiUrl}/account/addresses/${addressId}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error(`[ApiService] Error deleting user address ${addressId}:`, error);
        return throwError(() => error); // Re-throw error for component handling
      })
    );
  }

  setDefaultUserAddress(addressId: string, type: 'shipping' | 'billing'): Observable<void> {
    const url = `${this.apiUrl}/account/addresses/${addressId}/default/${type}`;
    return this.http.put<void>(url, {}).pipe( // PUT request with empty body
      catchError(error => {
        console.error(`[ApiService] Error setting default ${type} address ${addressId}:`, error);
        return throwError(() => error); // Re-throw error for component handling
      })
    );
  }

  // --- Account Order Methods ---

  getUserOrders(page: number = 1, limit: number = 10): Observable<PaginatedOrders> {
    const url = `${this.apiUrl}/account/orders`;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedOrders>(url, { params }).pipe(
      catchError(error => {
        console.error('[ApiService] Error fetching user orders:', error);
        return of({ orders: [], total: 0 }); // Return empty paginated result on error
      })
    );
  }

  getUserOrderDetails(orderId: string): Observable<OrderDto | null> {
    const url = `${this.apiUrl}/account/orders/${orderId}`;
    return this.http.get<OrderDto>(url).pipe(
      catchError(error => {
        console.error(`[ApiService] Error fetching order details for ${orderId}:`, error);
        return of(null); // Return null on error
      })
    );
  }

  // --- Account Wishlist Methods ---

  getUserWishlist(): Observable<WishlistDto | null> {
    // Assumes StoreContextGuard provides store context implicitly via URL or header
    // Backend route is /api/account/wishlist
    const url = `${this.apiUrl}/account/wishlist`;
    return this.http.get<WishlistDto>(url).pipe(
      catchError(error => {
        console.error('[ApiService] Error fetching user wishlist:', error);
        // Handle cases like 404 if wishlist doesn't exist yet, though backend might auto-create
        return of(null); // Return null on error
      })
    );
  }

  addItemToWishlist(productId: string): Observable<WishlistItemDto> {
    const url = `${this.apiUrl}/account/wishlist/items`;
    return this.http.post<WishlistItemDto>(url, { productId }).pipe(
      catchError(error => {
        console.error(`[ApiService] Error adding item ${productId} to wishlist:`, error);
        return throwError(() => error); // Re-throw for component handling
      })
    );
  }

  removeItemFromWishlist(itemId: string): Observable<void> {
    // itemId is the ID of the WishlistItemEntity
    const url = `${this.apiUrl}/account/wishlist/items/${itemId}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error(`[ApiService] Error removing item ${itemId} from wishlist:`, error);
        return throwError(() => error); // Re-throw for component handling
      })
    );
  }

  // --- Account Personal Info Methods ---

  // Uses backend GET /api/account/profile
  getUserProfile(): Observable<Omit<User, 'passwordHash' | 'roles' | 'addresses'> | null> { // Adjust User type as needed
    const url = `${this.apiUrl}/account/profile`;
    return this.http.get<Omit<User, 'passwordHash' | 'roles' | 'addresses'>>(url).pipe(
      catchError(error => {
        console.error('[ApiService] Error fetching user profile:', error);
        return of(null);
      })
    );
  }

  updateUserPersonalInfo(updateData: UpdateUserInfoDto): Observable<Omit<User, 'passwordHash' | 'roles' | 'addresses'>> {
    // Assuming backend endpoint is PATCH /api/account/personal-info
    // NOTE: Backend controller/service needs to be created/updated for this endpoint
    const url = `${this.apiUrl}/account/personal-info`;
    return this.http.patch<Omit<User, 'passwordHash' | 'roles' | 'addresses'>>(url, updateData).pipe(
      catchError(error => {
        console.error('[ApiService] Error updating user personal info:', error);
        return throwError(() => error); // Re-throw for component handling
      })
    );
  }

  // --- Account Password Change Method ---

  changeUserPassword(passwordData: ChangePasswordDto): Observable<void> { // Assuming backend returns no content on success
    // Assuming backend endpoint is POST /api/account/change-password
    // NOTE: Backend controller/service needs to be created/updated for this endpoint
    const url = `${this.apiUrl}/account/change-password`;
    return this.http.post<void>(url, passwordData).pipe(
      catchError(error => {
        console.error('[ApiService] Error changing user password:', error);
        return throwError(() => error); // Re-throw for component handling
      })
    );
  }

  // --- Account Payment Methods Methods ---

  getUserPaymentMethods(): Observable<PaymentMethodDto[]> {
    // Assuming backend endpoint GET /api/account/payment-methods
    // NOTE: Backend controller/service needs to be created/updated for this endpoint
    const url = `${this.apiUrl}/account/payment-methods`;
    return this.http.get<PaymentMethodDto[]>(url).pipe(
      catchError(error => {
        console.error('[ApiService] Error fetching user payment methods:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  deleteUserPaymentMethod(paymentMethodId: string): Observable<void> {
    // Assuming backend endpoint DELETE /api/account/payment-methods/:id
    // NOTE: Backend controller/service needs to be created/updated for this endpoint
    const url = `${this.apiUrl}/account/payment-methods/${paymentMethodId}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error(`[ApiService] Error deleting payment method ${paymentMethodId}:`, error);
        return throwError(() => error); // Re-throw for component handling
      })
    );
  }

  // Add methods for setting default if supported by backend

  // --- Product Review Methods ---

  getProductReviews(productId: string): Observable<any[]> { // Assuming review structure is any[] for now
    const url = `${this.apiUrl}/products/${productId}/reviews`;
    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error(`[ApiService] Error fetching reviews for product ${productId}:`, error);
        return of([]); // Return empty array on error
      })
    );
  }

  submitReview(reviewData: { productId: string, rating: number, comment: string }): Observable<any> { // Assuming reviewData structure
    const url = `${this.apiUrl}/reviews`; // Assuming endpoint is /api/reviews
    return this.http.post<any>(url, reviewData).pipe(
      catchError(error => {
        console.error('[ApiService] Error submitting review:', error);
        return throwError(() => error); // Re-throw for component handling
      })
    );
  }

  // --- Related Products Method ---

  getRelatedProducts(productId: string): Observable<Product[]> {
    // Assuming backend endpoint GET /api/products/:id/related
    const url = `${this.apiUrl}/products/${productId}/related`;
    return this.http.get<Product[]>(url).pipe(
      catchError(error => {
        console.error(`[ApiService] Error fetching related products for ${productId}:`, error);
        return of([]); // Return empty array on error
      })
    );
  }
} // End of ApiService class