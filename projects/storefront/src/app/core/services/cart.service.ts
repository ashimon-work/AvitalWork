import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError, map, first, Subject } from 'rxjs';
import { Product, Cart, CartItem } from '@shared-types';
import { ApiService } from './api.service';
import { AuthService } from './auth.service'; // For login/logout events
import { CartDrawerService } from './cart-drawer.service';
// Removed incorrect NestJS Logger import

export { type CartItem, type Cart as CartState } from '@shared-types';
// Interface for items in the cart (might evolve)
// export interface CartItem { // Use CartItem from shared-types
//   product: Product;
//   quantity: number;
// }

// Interface for the cart state
// export interface CartState { // Use Cart from shared-types
//   items: CartItem[];
//   totalItems: number;
//   // Add total price, etc. later
// }

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Removed NestJS logger instance
  // Use BehaviorSubject to hold and emit cart state, using Cart interface from shared-types
  private cartStateSubject = new BehaviorSubject<Cart | null>(null);
  cartState$ = this.cartStateSubject.asObservable();

  private itemAddedSource = new Subject<void>();
  itemAdded$ = this.itemAddedSource.asObservable();

  private readonly GUEST_CART_ID_KEY = 'guestCartId';
  private guestCartId: string | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService, // Inject AuthService
    private cartDrawerService: CartDrawerService // Inject CartDrawerService
  ) {
    this.guestCartId = localStorage.getItem(this.GUEST_CART_ID_KEY);
    this.loadInitialCart(this.guestCartId);

    // Listen to authentication changes
    this.authService.currentUser$.subscribe(user => {
      if (user) { // User logged in
        console.log('User logged in, attempting to merge cart.');
        this.mergeAndLoadUserCart();
      } else { // User logged out
        console.log('User logged out, clearing user cart and loading guest cart.');
        this.clearUserCartAndLoadGuestCart();
      }
    });
  }

  private mergeAndLoadUserCart(): void {
    const localGuestCartId = localStorage.getItem(this.GUEST_CART_ID_KEY);
    console.log(`Merging guest cart ID: ${localGuestCartId} into user cart.`);
    if (localGuestCartId) {
      this.apiService.mergeCart(localGuestCartId).pipe(
        tap((mergedCart) => {
          console.log('Guest cart merged successfully.', mergedCart);
          // this.clearLocalGuestCartId();
          // Update the cart state directly with the merged cart from the response
          this._updateStateFromBackendCart(mergedCart);
        }),
        catchError(err => {
          console.error('Error merging cart:', err);
          this.clearLocalGuestCartId(); // Clear local guest ID even if merge fails to avoid issues
          // Still try to load user cart as fallback
          this.loadInitialCart();
          return throwError(() => new Error('Failed to merge cart'));
        })
      ).subscribe();
    } else {
      // No guest cart to merge, just load user cart
      this.loadInitialCart();
    }
  }

  private clearUserCartAndLoadGuestCart(): void {
    this.cartStateSubject.next(null); // Clear current cart state
    // Potentially load a new or existing guest cart.
    // If a guestCartId was persisted from a previous guest session, use it.
    this.guestCartId = localStorage.getItem(this.GUEST_CART_ID_KEY);
    this.loadInitialCart(this.guestCartId);
  }


  public loadInitialCart(guestId?: string | null): void {
    console.log(`CartService: Loading initial cart. Guest ID: ${guestId}`);
    // ApiService.getCart will need to be updated to send guestId as a header
    this.apiService.getCart(guestId).pipe(
      first(),
      tap((response: Cart | any) => { // Use 'any' for now due to potential new guest cart structure
        // Backend returns guest_session_id field
        const responseGuestId = response?.guest_session_id || response?.guestCartId;
        if (response && responseGuestId) {
          const storedGuestId = localStorage.getItem(this.GUEST_CART_ID_KEY);
          // Update guest ID if backend returned one and it's different from stored value
          if (!storedGuestId || storedGuestId !== responseGuestId) {
            console.log(`CartService: Guest cart ID received from backend: ${responseGuestId}. ${storedGuestId ? 'Updating stored value.' : 'Storing it.'}`);
            localStorage.setItem(this.GUEST_CART_ID_KEY, responseGuestId);
            this.guestCartId = responseGuestId;
          } else {
            // Ensure this.guestCartId is synced even if localStorage already has it
            this.guestCartId = responseGuestId;
          }
        }
        this._updateStateFromBackendCart(response as Cart | null);
        console.log('Initial cart loaded/updated');
      }),
      catchError(error => {
        console.error('Error loading initial cart:', error);
        this.cartStateSubject.next(null);
        return throwError(() => new Error('Failed to load cart'));
      })
    ).subscribe();
  }

  // Observable for just the total item count (for header)
  getItemCount(): Observable<number> {
    return this.cartState$.pipe(map(cart => cart?.items?.length ?? 0)); // Map to items length for total count
  }

  // Add item to cart
  addItem(product: Product, quantity: number = 1): Observable<any> {
    const payload = { productId: product.id, quantity };
    console.log(`CartService: Adding item ${payload.productId} qty ${payload.quantity}. Guest ID: ${this.guestCartId}`);

    // ApiService.addToCart will need to be updated to send guestId as a header if user not logged in
    return this.apiService.addToCart(payload, this.guestCartId).pipe(
      tap((response: Cart) => {
        this._updateStateFromBackendCart(response);
        console.log(`Item added successfully. New state updated.`);
        this.itemAddedSource.next();
        this.cartDrawerService.open(); // Open cart drawer when item is added
      }),
      catchError(error => {
        console.error('Error adding item to cart:', error);
        return throwError(() => new Error('Failed to add item to cart'));
      })
    );
  }

  updateItemQuantity(productId: string, quantity: number): Observable<any> {
    console.log(`CartService: Updating item ${productId} qty ${quantity}. Guest ID: ${this.guestCartId}`);
    console.log('Current cart state:', this.getCurrentCart());
    console.log('Cart items:', this.getCurrentCart()?.items);

    // For logged-in users, we should not pass the guest cart ID
    //const cart = this.getCurrentCart();

    const isLoggedIn = !!this.authService.getToken();
    console.log(`User is ${isLoggedIn ? 'logged in' : 'not logged in'}.`);

    const guestCartId = isLoggedIn ? null : this.guestCartId;

    // Double-check that we're using the product ID, not the cart ID
    // console.log(`CartService: Using productId: ${productId}, cartId: ${cart?.id}`);


    // ApiService.updateCartItemQuantity will need to be updated
    return this.apiService.updateCartItemQuantity(productId, quantity, guestCartId).pipe(
      tap((response: Cart) => {
        this._updateStateFromBackendCart(response);
        console.log(`Item quantity updated successfully.`);
      }),
      catchError(error => {
        console.error('Error updating item quantity:', error);
        return throwError(() => new Error('Failed to update item quantity'));
      })
    );
  }

  removeItem(productId: string): Observable<any> {
    console.log(`CartService: Removing item ${productId}. Guest ID: ${this.guestCartId}`);
    // For logged-in users, we should not pass the guest cart ID
    const isLoggedIn = !!this.authService.getToken();

    console.log(`User is ${isLoggedIn ? 'logged in' : 'not logged in'}.`);

    const guestCartId = isLoggedIn ? null : this.guestCartId;


    return this.apiService.removeCartItem(productId, guestCartId).pipe(
      tap((response: Cart) => {
        this._updateStateFromBackendCart(response);
        console.log(`Item removed successfully.`);
      }),
      catchError(error => {
        console.error('Error removing item from cart:', error);
        return throwError(() => new Error('Failed to remove item from cart'));
      })
    );
  }

  // Helper to update local state from the backend's full Cart object
  private _updateStateFromBackendCart(backendCart: Cart | null): void {
    // For logged-in users, clear the guest cart ID since we now have a user cart
    const isUserCart = backendCart && backendCart.userId;
    if (isUserCart) {
      this.clearLocalGuestCartId();
    }

    // Sync guest_session_id if present in response (for guest carts only)
    if (backendCart && !isUserCart) {
      const responseGuestId = (backendCart as any)?.guest_session_id || backendCart?.guestCartId;
      if (responseGuestId) {
        const storedGuestId = localStorage.getItem(this.GUEST_CART_ID_KEY);
        if (!storedGuestId || storedGuestId !== responseGuestId) {
          localStorage.setItem(this.GUEST_CART_ID_KEY, responseGuestId);
          this.guestCartId = responseGuestId;
        } else {
          this.guestCartId = responseGuestId;
        }
      }
    }

    this.cartStateSubject.next(backendCart);
    console.log('Cart state updated from backend response:', this.cartStateSubject.getValue());
  }

  // Method to get the current cart state synchronously
  getCurrentCart(): Cart | null {
    return this.cartStateSubject.getValue();
  }

  private clearLocalGuestCartId(): void {
    localStorage.removeItem(this.GUEST_CART_ID_KEY);
    this.guestCartId = null;
    console.log('Local guest cart ID cleared.');
  }
}
