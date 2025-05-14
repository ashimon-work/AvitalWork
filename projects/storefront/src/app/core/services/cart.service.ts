import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError, map, first, Subject } from 'rxjs';
import { Product } from '@shared-types';
import { Cart, CartItem } from 'projects/shared-types/src/lib/cart.interface';
import { ApiService } from './api.service';
// Removed incorrect NestJS Logger import

export { type CartItem, type Cart as CartState } from 'projects/shared-types/src/lib/cart.interface';
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
  private cartStateSubject = new BehaviorSubject<Cart | null>(null); // Initialize with null or an empty Cart object
  cartState$ = this.cartStateSubject.asObservable();

  // Subject to signal when an item is successfully added
  private itemAddedSource = new Subject<void>();
  itemAdded$ = this.itemAddedSource.asObservable();

  constructor(private apiService: ApiService) {
    this.loadInitialCart();
  }

  public loadInitialCart(): void {
    this.apiService.getCart().pipe(
      first(), // Take the first emission
      tap((response: Cart | null) => { // Explicitly type the response
        // Assuming response is the full Cart object or null
        this._updateStateFromBackendCart(response);
        console.log('Initial cart loaded'); // Replaced logger
      }),
      catchError(error => {
        console.error('Error loading initial cart:', error); // Replaced logger
        // Initialize with null or an empty Cart object on error
        this.cartStateSubject.next(null); // Or { id: '', items: [], subtotal: 0 }
        return throwError(() => new Error('Failed to load cart'));
      })
    ).subscribe();
  }

  // Observable for just the total item count (for header)
  getItemCount(): Observable<number> {
    return this.cartState$.pipe(map(cart => cart ? cart.items.length : 0)); // Map to items length for total count
  }

  // Add item to cart
  addItem(product: Product, quantity: number = 1): Observable<any> {
    const payload = { productId: product.id, quantity };
    console.log(`CartService: Adding item ${payload.productId} qty ${payload.quantity}`); // Replaced logger

    return this.apiService.addToCart(payload).pipe(
      tap((response: Cart) => { // Assuming response is the updated Cart object
        // Assuming response is the full updated Cart object
        this._updateStateFromBackendCart(response);
        console.log(`Item added successfully. New state updated.`); // Replaced logger
        this.itemAddedSource.next(); // Signal that item was added
      }),
      catchError(error => {
        console.error('Error adding item to cart:', error); // Replaced logger
        // TODO: Add user-facing error handling
        return throwError(() => new Error('Failed to add item to cart'));
      })
    );
  }

  updateItemQuantity(productId: string, quantity: number): Observable<any> {
     console.log(`CartService: Updating item ${productId} qty ${quantity}`); // Replaced logger
     return this.apiService.updateCartItemQuantity(productId, quantity).pipe(
       tap((response: Cart) => { // Assuming response is the updated Cart object
         this._updateStateFromBackendCart(response);
           console.log(`Item quantity updated successfully.`); // Replaced logger
       }),
       catchError(error => {
         console.error('Error updating item quantity:', error); // Replaced logger
         return throwError(() => new Error('Failed to update item quantity'));
       })
     );
   }

   removeItem(productId: string): Observable<any> {
     console.log(`CartService: Removing item ${productId}`); // Replaced logger
     return this.apiService.removeCartItem(productId).pipe(
       tap((response: Cart) => { // Assuming response is the updated Cart object
         this._updateStateFromBackendCart(response);
           console.log(`Item removed successfully.`); // Replaced logger
       }),
       catchError(error => {
         console.error('Error removing item from cart:', error); // Replaced logger
         return throwError(() => new Error('Failed to remove item from cart'));
       })
     );
   }

  // Helper to update local state from the backend's full Cart object
  private _updateStateFromBackendCart(backendCart: Cart | null): void {
    this.cartStateSubject.next(backendCart);
    console.log('Cart state updated from backend response:', this.cartStateSubject.getValue()); // Replaced logger
  }

  // Method to get the current cart state synchronously
  getCurrentCart(): Cart | null {
    return this.cartStateSubject.getValue();
  }
}
