import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError, of, map, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService, WishlistItemDto, WishlistDto } from './api.service';
import { Product } from '@shared-types';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  // BehaviorSubject to hold the current wishlist items (as WishlistItemDto)
  private _wishlistItems = new BehaviorSubject<WishlistItemDto[]>([]);
  readonly wishlistItems$ = this._wishlistItems.asObservable();

  // Observable for just the product IDs in the wishlist
  readonly wishlistedProductIds$: Observable<string[]> = this.wishlistItems$.pipe(
    map(items => items.map(item => item.productId))
  );

  constructor() {
    this.authService.isAuthenticated$.pipe(
      switchMap(isLoggedIn => {
        if (isLoggedIn) {
          return this.fetchAndSetWishlist();
        } else {
          this._wishlistItems.next([]);
          return of(null);
        }
      })
    ).subscribe();
  }

  private fetchAndSetWishlist(): Observable<WishlistDto | null> {
    return this.apiService.getUserWishlist().pipe(
      tap((wishlist: WishlistDto | null) => {
        if (wishlist && wishlist.items) {
          this._wishlistItems.next(wishlist.items);
          console.log('Wishlist fetched and updated:', wishlist.items);
        } else {
          this._wishlistItems.next([]);
          console.log('No wishlist found or wishlist is empty.');
        }
      }),
      catchError((error: any) => {
        console.error('WishlistService: Failed to fetch wishlist', error);
        this._wishlistItems.next([]);
        return of(null);
      })
    );
  }

  addItem(productId: string): Observable<WishlistItemDto | null> {
    if (!this.authService.getToken()) {
      console.warn('WishlistService: User not logged in. Cannot add to wishlist.');
      return of(null);
    }
    return this.apiService.addItemToWishlist(productId).pipe(
      tap((addedItem) => {
        if (addedItem) {
          console.log(`Product ${productId} added to wishlist.`);
          // Add to local state optimistically or refetch
          const currentItems = this._wishlistItems.getValue();
          this._wishlistItems.next([...currentItems, addedItem]);
          // Or call this.fetchAndSetWishlist().subscribe(); for full refresh
        }
      }),
      catchError((error: any) => {
        console.error('WishlistService: Failed to add item to wishlist', error);
        // TODO: Handle specific errors (e.g., already in wishlist)
        return of(null); // Return null on error
      })
    );
  }

  removeItem(productId: string): Observable<void | null> {
    if (!this.authService.getToken()) {
      console.warn('WishlistService: User not logged in. Cannot remove from wishlist.');
      return of(null);
    }

    const itemToRemove = this._wishlistItems.getValue().find(item => item.productId === productId);
    if (!itemToRemove) {
      console.warn(`WishlistService: Product ${productId} not found in local wishlist state. Cannot remove.`);
      return of(null);
    }

    return this.apiService.removeItemFromWishlist(itemToRemove.id).pipe(
      tap(() => {
        console.log(`Product ${productId} (item ID: ${itemToRemove.id}) removed from wishlist.`);
        // Remove from local state optimistically or refetch
        const currentItems = this._wishlistItems.getValue();
        this._wishlistItems.next(currentItems.filter(item => item.id !== itemToRemove.id));
        // Or call this.fetchAndSetWishlist().subscribe(); for full refresh
      }),
      catchError((error: any) => {
        console.error('WishlistService: Failed to remove item from wishlist', error);
        return of(null); // Return null on error
      })
    );
  }

  // Renamed from getWishlist to avoid confusion with the internal fetch
  public refreshWishlist(): Observable<WishlistDto | null> {
    if (!this.authService.getToken()) {
      this._wishlistItems.next([]);
      return of(null);
    }
    return this.fetchAndSetWishlist();
  }

  isInWishlist(productId: string): Observable<boolean> {
    return this.wishlistItems$.pipe(
      map((wishlistItems: WishlistItemDto[]) => wishlistItems.some(item => item.productId === productId))
    );
  }

  // Helper to get current wishlist items directly (e.g., for product page initial check)
  getCurrentWishlistItems(): WishlistItemDto[] {
    return this._wishlistItems.getValue();
  }
}