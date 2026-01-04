import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, take, catchError, tap, filter, map } from 'rxjs/operators';
import { Category, Product, Address, Order, User, Cart, Store } from '@shared-types';
import { CarouselSlide } from '../../home/components/carousel/carousel.component';
import { StoreContextService } from './store-context.service';
import { AuthService } from './auth.service';
// Define Wishlist types locally if not in shared-types
// Based on backend DTOs
export interface WishlistItemDto {
  id: string;
  productId: string;
  addedAt: Date;
  product: Partial<Product>;
}

export interface WishlistDto {
  id: string;
  userId: string;
  storeId: string;
  items: WishlistItemDto[];
  createdAt: Date;
  updatedAt: Date;
}
// Define Address type locally if not in shared-types
export interface AddressDto {
  id: string;
  fullName: string;
  street1: string; // Renamed from street, removed address1
  street2?: string; // Added, removed address2
  city: string;
  // state?: string; // Removed state
  postalCode: string; // Kept, removed zipCode
  country: string;
  phoneNumber?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
  // Add createdAt/updatedAt if needed
}

// Define Order types locally if not in shared-types
export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  variantDetails?: string;
  product?: Partial<Product>; // Use shared Product type
}

export interface OrderDto {
  id: string;
  orderReference: string;
  orderDate: Date;
  status: string;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  shippingAddress: AddressDto;
  shippingMethod?: string;
  paymentStatus: string;
  trackingNumber?: string;
  items: OrderItemDto[];
  updatedAt: Date;
  notes: string[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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
  type: string; // From backend: 'card', 'paypal' etc. (corresponds to PaymentMethodEntity.type)
  cardBrand?: string; // e.g., 'Visa', 'Mastercard' (corresponds to PaymentMethodEntity.cardBrand)
  last4?: string; // Last 4 digits
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
  billingAddress?: AddressDto; // Include the billing address object
  // paymentGatewayToken?: string; // Usually not sent to frontend unless for specific re-use cases
  // metadata?: Record<string, any>; // If needed by frontend
}

// --- Payment Method DTOs for Frontend ---
export interface CreatePaymentMethodPayload {
  type: string; // e.g., 'card'
  paymentGatewayToken: string; // Token from payment provider (e.g., Stripe, Braintree)
  billingAddressId: string;
  isDefault?: boolean;
  // Potentially card brand, last4, expiry if your gateway returns them upon tokenization
  // and you want to display them immediately without another fetch.
  // cardBrand?: string;
  // last4?: string;
  // expiryMonth?: number;
  // expiryYear?: number;
}

export interface UpdatePaymentMethodPayload {
  billingAddressId?: string;
  isDefault?: boolean;
  // Other fields like cardholderName if applicable and updatable directly
  // (usually for non-tokenized details, which is rare and not recommended)
}
// --- Shipping Method DTO ---
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  cost: number;
  estimatedDeliveryDays?: number;
  // Add any other relevant fields from your backend
}
// --- Account Overview DTO ---
export interface AccountOverviewDto {
  profile: Omit<User, 'passwordHash' | 'roles' | 'addresses' | 'wishlists' | 'loginHistory' | 'notes' | 'paymentMethods'>; // Use a more specific UserProfileDto if available
  recentOrders: OrderDto[];
  addresses: AddressDto[];
  // paymentMethods: PaymentMethodDto[]; // Add if backend includes this
}
export interface FaqItem {
  question: string;
  answer: string;
}

export interface AboutContent {
  title?: string;
  body: string;
  imageUrl?: string;
}

export interface Testimonial {
  author: string;
  quote: string;
  date?: string;
  rating?: number;
}

// --- Newsletter Types ---
export interface SubscribeNewsletterPayload {
  email: string;
  source?: string;
}

export interface NewsletterSubscriptionDto {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  source?: string;
}
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private storeContext = inject(StoreContextService);
  private authService = inject(AuthService); // Inject AuthService
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
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when fetching featured products.');
          return throwError(() => new Error('Store context is required to fetch featured products.'));
        }
        const url = `${this.apiUrl}/stores/${storeSlug}/products/featured`;
        // storeSlug is now in the path, no need for HttpParams for it.
        return this.http.get<Product[]>(url);
      }),
      catchError(error => {
        console.error('[ApiService] Error fetching featured products:', error);
        return of([]); // Return empty array on error or handle as appropriate
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
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when fetching products.');
          return throwError(() => new Error('Store context is required to fetch products.'));
        }
        const url = `${this.apiUrl}/stores/${storeSlug}/products`;
        let httpParams = new HttpParams();
        // storeSlug is in the path, remove from queryParams if it exists there
        const { storeSlug: _, ...otherParams } = queryParams;
        Object.keys(otherParams).forEach(key => {
          if (otherParams[key] !== undefined && otherParams[key] !== null) {
            httpParams = httpParams.set(key, otherParams[key].toString());
          }
        });
        return this.http.get<{ products: Product[], total: number }>(url, { params: httpParams });
      }),
      catchError(error => {
        console.error('[ApiService] Error fetching products:', error);
        // Consider returning a more specific error or an empty paginated structure
        return throwError(() => error);
      })
    );
  }

  getProductsByIds(productIds: string[]): Observable<Product[]> {
    // This method now relies on the storeSlug from storeContext
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when fetching products by IDs.');
          return throwError(() => new Error('Store context is required to fetch products by IDs.'));
        }
        if (!productIds || productIds.length === 0) {
          return of([]); // No IDs, return empty array
        }
        const url = `${this.apiUrl}/stores/${storeSlug}/products`;
        // The backend /products endpoint (now /stores/:storeSlug/products)
        // should handle an 'ids' query parameter.
        const params = new HttpParams().set('ids', productIds.join(','));
        return this.http.get<Product[]>(url, { params });
      }),
      catchError(error => {
        console.error('[ApiService] Error fetching products by IDs:', error);
        return of([]);
      })
    );
  }

  // Method for product search - uses the main getProducts endpoint with 'q'
  searchProducts(query: string): Observable<Product[]> {
    // This will now use the updated getProducts which handles the new path structure
    return this.getProducts({ q: query }).pipe(
      map(response => response.products), // Extract products array from paginated response
      tap(response => console.log('[ApiService] Search products response:', response)),
      catchError(error => {
        console.error('[ApiService] Error searching products:', error);
        return of([]);
      })
    );
  }

  getProductDetails(productId: string): Observable<Product> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when fetching product details.');
          return throwError(() => new Error('Store context is required to fetch product details.'));
        }
        // The :id is relative to /stores/:storeSlug/products/
        const url = `${this.apiUrl}/stores/${storeSlug}/products/${productId}`;
        // No params needed for storeSlug as it's in the path
        return this.http.get<Product>(url);
      }),
      catchError(error => {
        console.error(`[ApiService] Error fetching product details for ${productId}:`, error);
        return throwError(() => error);
      })
    );
  }

  addToCart(payload: { productId: string, quantity: number }, guestCartId?: string | null): Observable<Cart> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when adding to cart.');
          return throwError(() => new Error('Store context is required to add to cart.'));
        }
        const url = `${this.apiUrl}/stores/${storeSlug}/cart/add`;
        let headers = new HttpHeaders();
        const token = this.authService.getToken();

        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        } else if (guestCartId) {
          headers = headers.set('x-guest-session-id', guestCartId);
        }
        return this.http.post<Cart>(url, payload, { headers });
      }),
      catchError(error => {
        console.error('[ApiService] Error adding to cart:', error);
        return throwError(() => error);
      })
    );
  }

  subscribeNewsletter(payload: SubscribeNewsletterPayload): Observable<NewsletterSubscriptionDto> {
    return this.http.post<NewsletterSubscriptionDto>(`${this.apiUrl}/newsletter/subscribe`, payload);
  }

  getCart(guestCartId?: string | null): Observable<Cart | any> { // Allow 'any' for the new guest cart structure from controller
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when fetching cart.');
          // The backend guard will catch this and return a 400.
          // No need to pass storeSlug as query param anymore.
          return throwError(() => new Error('Store context is required to fetch cart.'));
        }
        const url = `${this.apiUrl}/stores/${storeSlug}/cart`;
        let headers = new HttpHeaders();
        if (guestCartId && !this.authService.getToken()) {
          headers = headers.set('x-guest-session-id', guestCartId);
        }
        // storeSlug is now part of the URL, not a query param for this endpoint
        return this.http.get<Cart | any>(url, { headers });
      }),
      catchError(error => {
        console.error('[ApiService] Error fetching cart:', error);
        return throwError(() => error); // Re-throw the error for the calling service to handle
      })
    );
  }

  updateCartItemQuantity(cartItemId: string, quantity: number, guestCartId?: string | null): Observable<Cart> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        const url = `${this.apiUrl}/stores/${storeSlug}/cart/${cartItemId}`;

        // ודאי שה-Body נשלח בדיוק כך
        const body = { quantity: Number(quantity) };

        let headers = new HttpHeaders();
        const token = this.authService.getToken();

        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        } else if (guestCartId) {
          headers = headers.set('x-guest-session-id', guestCartId);
        }

        return this.http.patch<Cart>(url, body, { headers });
      })
    );
  }

  // Helper method to check if a string is a UUID
  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  removeCartItem(cartItemId: string, guestCartId?: string | null): Observable<Cart> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when removing cart item.');
          return throwError(() => new Error('Store context is required to remove cart item.'));
        }
        const url = `${this.apiUrl}/stores/${storeSlug}/cart/${cartItemId}`;
        let headers = new HttpHeaders();
        const token = this.authService.getToken();

        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        } else if (guestCartId) {
          headers = headers.set('x-guest-session-id', guestCartId);
        }
        return this.http.delete<Cart>(url, { headers });
      }),
      catchError(error => {
        console.error('[ApiService] Error removing cart item:', error);
        return throwError(() => error);
      })
    );
  }

  mergeCart(guestCartId: string): Observable<Cart> {
    // This endpoint must be authenticated by JwtAuthGuard on the backend.
    // It also needs the storeSlug in the path.
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when merging cart.');
          return throwError(() => new Error('Store context is required to merge cart.'));
        }
        // Assuming the backend CartController for merge does not yet have :storeSlug in its path.
        // If it does, the URL needs to be /stores/:storeSlug/cart/merge
        // For now, let's assume it's /cart/merge and it might implicitly use user's store or needs update.
        // Based on CartController, merge is not defined. Let's assume it should be under the store context.
        // If CartController.merge is added, it should be @Post('merge') @UseGuards(StoreContextGuard)
        // and the URL here should be:
        const url = `${this.apiUrl}/stores/${storeSlug}/cart/merge`;
        // The backend controller for merge needs to be created or confirmed.
        // For now, this will likely fail if the backend endpoint isn't /stores/:storeSlug/cart/merge
        return this.http.post<Cart>(url, { guestSessionId: guestCartId });
      }),
      catchError(error => {
        console.error('[ApiService] Error merging cart:', error);
        return throwError(() => error);
      })
    );
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
  getSearchSuggestions(query: string, limit: number = 5): Observable<Product[]> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          const errorMsg = '[ApiService] Cannot fetch search suggestions: Store slug is missing.';
          console.error(errorMsg);
          return throwError(() => new Error(errorMsg));
        }
        // URL is now /stores/:storeSlug/products/suggest
        const url = `${this.apiUrl}/stores/${storeSlug}/products/suggest`;
        const params = new HttpParams()
          .set('q', query)
          .set('limit', limit.toString());
        // storeSlug is in the path, not a query param

        console.log(`[ApiService] Fetching search suggestions from: ${url} with params:`, params.toString());
        return this.http.get<Product[]>(url, { params });
      }),
      catchError(error => {
        console.error('[ApiService] Error fetching search suggestions:', error);
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
    const url = `${this.apiUrl}/store/slug/${slug}`; // Changed "stores" to "store"
    console.log(`[ApiService] Checking store slug validity: ${url}`);
    return this.http.get<any>(url).pipe(
      map(() => true), // If request succeeds (2xx), slug is valid
      catchError(error => {
        console.warn(`[ApiService] Store slug "${slug}" is invalid or API error:`, error.status);
        return of(false); // If request fails (e.g., 404), slug is invalid
      })
    );
  }

  getStoreDetailsBySlug(slug: string): Observable<Store | null> {
    const url = `${this.apiUrl}/store/slug/${slug}`; // Fixed: Changed "stores" to "store"
    console.log(`[ApiService] Fetching store details from: ${url}`);
    return this.http.get<Store>(url).pipe(
      tap(response => console.log(`[ApiService] Store details for slug "${slug}":`, response)),
      catchError(error => {
        console.error(`[ApiService] Error fetching store details for slug "${slug}":`, error);
        return of(null); // Return null on error (e.g., 404 Not Found)
      })
    );
  }

  // --- Contact Page Methods ---

  getFaqs(storeSlug: string | null): Observable<FaqItem[]> {
    let params = new HttpParams();
    if (storeSlug) {
      params = params.set('storeSlug', storeSlug);
    }
    const url = `${this.apiUrl}/faq`;
    console.log(`[ApiService] Fetching FAQs from: ${url} with params:`, params.toString());
    return this.http.get<FaqItem[]>(url, { params }).pipe(
      tap(response => console.log('[ApiService] FAQs response:', response)),
      catchError(error => {
        console.error('[ApiService] Error fetching FAQs:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  submitContactForm(storeSlug: string | null, formData: { name: string; email: string; subject: string; message: string; }): Observable<any> {
    // Remove storeSlug from payload since it should be passed as query parameter for StoreContextGuard
    const payload = { ...formData };
    const url = `${this.apiUrl}/contact`;

    // Add storeSlug as query parameter if available
    let params = new HttpParams();
    if (storeSlug) {
      params = params.set('storeSlug', storeSlug);
    }

    console.log(`[ApiService] Submitting contact form to: ${url} with payload:`, payload, 'and params:', params.toString());
    return this.http.post<any>(url, payload, { params }).pipe(
      catchError(error => {
        console.error('[ApiService] Error submitting contact form:', error);
        return throwError(() => error); // Re-throw error for component handling
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

  getUserOrders(page: number = 1, limit: number = 10, storeSlug?: string | null): Observable<PaginatedOrders> {
    const url = `${this.apiUrl}/account/orders`;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (storeSlug) {
      params = params.set('storeSlug', storeSlug);
    }

    return this.http.get<PaginatedOrders>(url, { params }).pipe(
      catchError(error => {
        console.error('[ApiService] Error fetching user orders:', error);
        return of({ orders: [], total: 0 });
      })
    );
  }

  getUserOrderDetails(orderId: string, storeSlug?: string | null): Observable<OrderDto | null> {
    const url = `${this.apiUrl}/account/orders/${orderId}`;
    let params = new HttpParams();
    if (storeSlug) {
      params = params.set('storeSlug', storeSlug);
    }
    return this.http.get<OrderDto>(url, { params }).pipe(
      catchError(error => {
        console.error(`[ApiService] Error fetching order details for ${orderId}:`, error);
        return of(null); // Return null on error
      })
    );
  }

  // --- Account Wishlist Methods ---

  getUserWishlist(): Observable<WishlistDto | null> {
    const url = `${this.apiUrl}/account/wishlist`;
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when fetching user wishlist.');
          return throwError(() => new Error('Store context is required to fetch user wishlist.'));
        }
        const params = new HttpParams().set('storeSlug', storeSlug);
        return this.http.get<WishlistDto>(url, { params });
      }),
      catchError(error => {
        console.error('[ApiService] Error fetching user wishlist:', error);
        return of(null);
      })
    );
  }

  addItemToWishlist(productId: string): Observable<WishlistItemDto> {
    const url = `${this.apiUrl}/account/wishlist/items`;
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when adding item to wishlist.');
          return throwError(() => new Error('Store context is required to add item to wishlist.'));
        }
        const params = new HttpParams().set('storeSlug', storeSlug);
        // Backend expects productId in body, storeSlug as query param for StoreContextGuard
        return this.http.post<WishlistItemDto>(url, { productId }, { params });
      }),
      catchError(error => {
        console.error(`[ApiService] Error adding item ${productId} to wishlist:`, error);
        return throwError(() => error);
      })
    );
  }

  removeItemFromWishlist(itemId: string): Observable<void> {
    const url = `${this.apiUrl}/account/wishlist/items/${itemId}`;
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when removing item from wishlist.');
          return throwError(() => new Error('Store context is required to remove item from wishlist.'));
        }
        const params = new HttpParams().set('storeSlug', storeSlug);
        return this.http.delete<void>(url, { params });
      }),
      catchError(error => {
        console.error(`[ApiService] Error removing item ${itemId} from wishlist:`, error);
        return throwError(() => error);
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

  // --- Account Overview Method ---
  getAccountOverview(): Observable<AccountOverviewDto | null> {
    const url = `${this.apiUrl}/account/overview`;
    // StoreContextGuard on the backend handles storeSlug implicitly if this endpoint is store-specific
    // If not store-specific, no storeSlug param is needed here.
    // Assuming it requires store context based on backend controller.
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      filter(storeSlug => { // Ensure storeSlug is available before making the call
        if (!storeSlug) {
          console.warn('[ApiService] Store slug not available for getAccountOverview. Overview might be limited or fail if store-specific.');
          // Depending on backend, you might allow the call or throw an error/return null.
          // For now, let's proceed, backend might handle it or it's not strictly store-specific.
        }
        return true; // Continue the stream
      }),
      switchMap(storeSlug => {
        let params = new HttpParams();
        if (storeSlug) { // Add storeSlug if available and backend expects it
          params = params.set('storeSlug', storeSlug);
        }
        return this.http.get<AccountOverviewDto>(url, { params });
      }),
      catchError(error => {
        console.error('[ApiService] Error fetching account overview:', error);
        return of(null);
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

  addUserPaymentMethod(payload: CreatePaymentMethodPayload): Observable<PaymentMethodDto> {
    const url = `${this.apiUrl}/account/payment-methods`;
    return this.http.post<PaymentMethodDto>(url, payload).pipe(
      catchError(error => {
        console.error('[ApiService] Error adding user payment method:', error);
        return throwError(() => error);
      })
    );
  }

  updateUserPaymentMethod(methodId: string, payload: UpdatePaymentMethodPayload): Observable<PaymentMethodDto> {
    const url = `${this.apiUrl}/account/payment-methods/${methodId}`;
    return this.http.patch<PaymentMethodDto>(url, payload).pipe(
      catchError(error => {
        console.error(`[ApiService] Error updating payment method ${methodId}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Add methods for setting default if supported by backend

  // --- Product Review Methods ---

  getProductReviews(productId: string): Observable<any[]> { // Assuming review structure is any[] for now
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when fetching product reviews.');
          return throwError(() => new Error('Store context is required to fetch product reviews.'));
        }
        const url = `${this.apiUrl}/stores/${storeSlug}/reviews/products/${productId}`;
        // storeSlug is now in the path, no HttpParams needed for it here.
        return this.http.get<any[]>(url);
      }),
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
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when fetching related products.');
          return throwError(() => new Error('Store context is required to fetch related products.'));
        }
        // Assuming backend endpoint is GET /api/stores/:storeSlug/products/:id/related
        // This requires the backend ProductsController to have a nested route for related products.
        // If it's just /api/products/:id/related and it infers store from product, this is fine.
        // For consistency with other product routes, let's assume it needs storeSlug in path.
        // The backend controller needs to be updated if this path is not correct.
        // For now, assuming the :id for related is relative to /products, not /stores/:storeSlug/products
        // This might need adjustment based on actual backend route for related products.
        // Let's assume for now it's /api/stores/:storeSlug/products/:productId/related
        const url = `${this.apiUrl}/stores/${storeSlug}/products/${productId}/related`;
        return this.http.get<Product[]>(url);
      }),
      catchError(error => {
        console.error(`[ApiService] Error fetching related products for ${productId}:`, error);
        return of([]);
      })
    );
  }

  getRecommendedProducts(orderId?: string): Observable<Product[]> { // orderId is optional
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when fetching recommended products.');
          return throwError(() => new Error('Store context is required to fetch recommended products.'));
        }
        // URL is now /stores/:storeSlug/products/recommended
        const url = `${this.apiUrl}/stores/${storeSlug}/products/recommended`;
        let params = new HttpParams();
        if (orderId) {
          params = params.set('based_on', orderId);
        }
        // storeSlug is in the path
        return this.http.get<Product[]>(url, { params });
      }),
      catchError(error => {
        console.error(`[ApiService] Error fetching recommended products (orderId: ${orderId}):`, error);
        return of([]);
      })
    );
  }

  applyPromoCodeToCart(promoCode: string, guestCartId?: string | null): Observable<any> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when applying promo code.');
          return throwError(() => new Error('Store context is required to apply promo code.'));
        }
        // The backend CartController @Post('promo') is under /stores/:storeSlug/cart
        const url = `${this.apiUrl}/stores/${storeSlug}/cart/promo`;
        const payload = { promoCode }; // storeSlug is in the path, not payload for this endpoint

        let headers = new HttpHeaders();
        if (guestCartId && !this.authService.getToken()) {
          headers = headers.set('x-guest-session-id', guestCartId);
        }

        return this.http.post(url, payload, { headers });
      }),
      catchError(error => {
        console.error('[ApiService] Error applying promo code:', error);
        return throwError(() => error); // Re-throw for component handling
      })
    );
  }

  // --- Checkout Methods ---

  getShippingMethods(storeSlug: string): Observable<ShippingMethod[]> {
    const url = `${this.apiUrl}/shipping/methods`;
    let params = new HttpParams();
    if (storeSlug) {
      params = params.set('storeSlug', storeSlug);
    }
    return this.http.get<ShippingMethod[]>(url, { params }).pipe(
      catchError(error => {
        console.error('[ApiService] Error fetching shipping methods:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  getTaxEstimate(storeSlug: string, cartItems: { productId: string, quantity: number }[], shippingAddress: any /* TODO: Define proper Address type for payload */): Observable<{ taxAmount: number }> {
    const url = `${this.apiUrl}/tax/estimate`;
    // Backend might expect cart items and address in body or params.
    // Assuming POST with payload for now as tax calculation can be complex.
    const payload = {
      cartItems,
      shippingAddress,
      storeSlug // Pass storeSlug in payload if backend expects it for multi-store tax rules
    };
    // No HttpParams needed if all data is in payload for POST
    return this.http.post<{ taxAmount: number }>(url, payload).pipe(
      catchError(error => {
        console.error('[ApiService] Error fetching tax estimate:', error);
        return of({ taxAmount: 0 }); // Return 0 tax on error or handle differently
      })
    );
  }

  placeOrder(orderData: any): Observable<any> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.error('[ApiService] Store slug is missing when placing order.');
          return throwError(() => new Error('Store context is required to place order.'));
        }

        const url = `${this.apiUrl}/checkout/orders`;
        let params = new HttpParams();
        params = params.set('storeSlug', storeSlug);

        return this.http.post<any>(url, orderData, { params }).pipe(
          catchError(error => {
            console.error('[ApiService] Error placing order:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  // Tranzila integration methods
  getTranzilaTokenizationUrl(): Observable<{ tokenizationUrl: string }> {
    return this.http.post<{ tokenizationUrl: string }>(`${this.apiUrl}/tranzila/tokenization-url`, {});
  }

  getMyCreditCard(): Observable<any> {
    return this.storeContext.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) {
          return throwError(() => new Error('Store context is required.'));
        }
        const params = new HttpParams().set('storeSlug', storeSlug);
        return this.http.get(`${this.apiUrl}/checkout/tranzila/me/credit-card`, { params });
      })
    );
  }

  checkCreditCardStatus(): Observable<{ hasCard: boolean; cardInfo?: any }> {
    return this.getMyCreditCard().pipe(
      map(cardInfo => {
        if (cardInfo && Object.keys(cardInfo).length > 0) {
          return { hasCard: true, cardInfo };
        }
        return { hasCard: false };
      }),
      catchError(() => of({ hasCard: false }))
    );
  }

  // --- About Page Methods ---

  getStoreAboutContent(storeSlug: string | null): Observable<AboutContent | null> {
    let params = new HttpParams();
    if (storeSlug) {
      params = params.set('storeSlug', storeSlug);
    }
    const url = `${this.apiUrl}/store/about`;
    console.log(`[ApiService] Fetching store about content from: ${url} with params:`, params.toString());
    return this.http.get<AboutContent>(url, { params }).pipe(
      tap(response => console.log('[ApiService] Store about content response:', response)),
      catchError(error => {
        console.error('[ApiService] Error fetching store about content:', error);
        return of(null); // Return null on error
      })
    );
  }

  getStoreTestimonials(storeSlug: string | null): Observable<Testimonial[]> {
    let params = new HttpParams();
    if (storeSlug) {
      params = params.set('storeSlug', storeSlug);
    }
    const url = `${this.apiUrl}/store/testimonials`;
    console.log(`[ApiService] Fetching store testimonials from: ${url} with params:`, params.toString());
    return this.http.get<Testimonial[]>(url, { params }).pipe(
      tap(response => console.log('[ApiService] Store testimonials response:', response)),
      catchError(error => {
        console.error('[ApiService] Error fetching store testimonials:', error);
        return of([]); // Return empty array on error
      })
    );
  }
} // End of ApiService class
