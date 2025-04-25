import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { AuthService } from './auth.service'; // Assuming AuthService exists and provides user info
import { Product } from '@shared-types'; // Assuming Product interface is needed

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // BehaviorSubject to hold the current wishlist state
  private _wishlistItems = new BehaviorSubject<Product[]>([]);
  readonly wishlistItems$ = this._wishlistItems.asObservable();

  constructor() {
    // Fetch wishlist on service initialization if user is already logged in
    this.authService.isAuthenticated$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.getWishlist().subscribe(); // Fetch wishlist on login
      } else {
        this._wishlistItems.next([]); // Clear wishlist on logout
      }
    });
  }

  // Method to add a product to the wishlist
  addItem(productId: string): Observable<any> { // Adjust return type based on API
    const userId = this.authService.getCurrentUserSnapshot()?.id; // Get user ID using snapshot
    if (!userId) {
      console.warn('WishlistService: User not logged in. Cannot add to wishlist.');
      // Return an observable that immediately completes or errors
      return of(null); // Or throw an error
    }

    // Assuming the backend endpoint is POST /api/wishlist/add
    // And it expects a body like { userId: string, productId: string }
    return this.http.post(`/api/wishlist/add`, { userId, productId }).pipe(
      tap(() => {
        console.log(`Product ${productId} added to wishlist for user ${userId}`);
        // After adding, refresh the wishlist state
        this.getWishlist().subscribe();
      }),
      catchError((error: any) => { // Add type annotation for error
        console.error('WishlistService: Failed to add item to wishlist', error);
        // TODO: Handle specific errors (e.g., already in wishlist)
        throw error; // Re-throw the error
      })
    );
  }

  // Method to remove a product from the wishlist
  removeItem(productId: string): Observable<any> { // Adjust return type based on API
    const userId = this.authService.getCurrentUserSnapshot()?.id; // Get user ID using snapshot
    if (!userId) {
      console.warn('WishlistService: User not logged in. Cannot remove from wishlist.');
      return of(null); // Or throw an error
    }

    // Assuming the backend endpoint is DELETE /api/wishlist/remove/{userId}/{productId}
    // Or DELETE /api/wishlist/remove with body { userId, productId }
    // Using DELETE with body might be less conventional, so let's assume params for now
    // Adjust based on actual backend implementation
    return this.http.delete(`/api/wishlist/remove/${userId}/${productId}`).pipe(
      tap(() => {
        console.log(`Product ${productId} removed from wishlist for user ${userId}`);
        // After removing, refresh the wishlist state
        this.getWishlist().subscribe();
      }),
      catchError((error: any) => { // Add type annotation for error
        console.error('WishlistService: Failed to remove item from wishlist', error);
        throw error;
      })
    );
  }

  // Method to get the user's wishlist
  getWishlist(): Observable<Product[]> {
    const userId = this.authService.getCurrentUserSnapshot()?.id;
    if (!userId) {
      this._wishlistItems.next([]); // Clear wishlist if not logged in
      return of([]); // Return empty array if not logged in
    }
    // Assuming backend endpoint is GET /api/wishlist/{userId}
    return this.http.get<Product[]>(`/api/wishlist/${userId}`).pipe(
      tap(wishlistItems => {
        console.log('Wishlist fetched:', wishlistItems);
        this._wishlistItems.next(wishlistItems);
      }),
      catchError((error: any) => { // Add type annotation for error
        console.error('WishlistService: Failed to fetch wishlist', error);
        this._wishlistItems.next([]); // Clear wishlist on error
        return of([]); // Return empty array on error
      })
    );
  }

  // Method to check if a product is in the wishlist (uses the BehaviorSubject)
  isInWishlist(productId: string): Observable<boolean> {
    return this.wishlistItems$.pipe(
      map((wishlistItems: Product[]) => wishlistItems.some((item: Product) => item.id === productId))
    );
  }
}