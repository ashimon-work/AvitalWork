import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError, map, first } from 'rxjs'; // Added first
import { Product } from '@shared-types';
import { ApiService } from './api.service';
// Removed incorrect NestJS Logger import

// Interface for items in the cart (might evolve)
export interface CartItem {
  product: Product;
  quantity: number;
}

// Interface for the cart state
export interface CartState {
  items: CartItem[];
  totalItems: number;
  // Add total price, etc. later
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Removed NestJS logger instance
  // Use BehaviorSubject to hold and emit cart state
  private cartStateSubject = new BehaviorSubject<CartState>({ items: [], totalItems: 0 });
  cartState$ = this.cartStateSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadInitialCart();
  }

  private loadInitialCart(): void {
    this.apiService.getCart().pipe(
      first(), // Take the first emission
      tap(response => {
        // Assuming response is { cart: { [productId: string]: number } }
        this._updateStateFromBackendCart(response.cart || {});
        console.log('Initial cart loaded'); // Replaced logger
      }),
      catchError(error => {
        console.error('Error loading initial cart:', error); // Replaced logger
        // Initialize with empty cart on error
        this.cartStateSubject.next({ items: [], totalItems: 0 });
        return throwError(() => new Error('Failed to load cart'));
      })
    ).subscribe();
  }

  // Observable for just the total item count (for header)
  getItemCount(): Observable<number> {
    return this.cartState$.pipe(map(state => state.totalItems));
  }

  // Add item to cart
  addItem(product: Product, quantity: number = 1): Observable<any> {
    const payload = { productId: product.id, quantity };
    console.log(`CartService: Adding item ${payload.productId} qty ${payload.quantity}`); // Replaced logger

    return this.apiService.addToCart(payload).pipe(
      tap((response) => {
        // Assuming response is { success: boolean, message: string, cart: { [productId: string]: number } }
        if (response.success) {
          this._updateStateFromBackendCart(response.cart || {});
          console.log(`Item added successfully. New state updated.`); // Replaced logger
        } else {
          console.warn(`Failed to add item via API: ${response.message}`); // Replaced logger
          // Optionally re-sync state if API failed but local state was optimistic
          // this.loadInitialCart(); // Or handle more gracefully
        }
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
       tap((response) => {
         if (response.success) {
           this._updateStateFromBackendCart(response.cart || {});
           console.log(`Item quantity updated successfully.`); // Replaced logger
         } else {
           console.warn(`Failed to update quantity via API: ${response.message}`); // Replaced logger
         }
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
       tap((response) => {
         if (response.success) {
           this._updateStateFromBackendCart(response.cart || {});
           console.log(`Item removed successfully.`); // Replaced logger
         } else {
           console.warn(`Failed to remove item via API: ${response.message}`); // Replaced logger
         }
       }),
       catchError(error => {
         console.error('Error removing item from cart:', error); // Replaced logger
         return throwError(() => new Error('Failed to remove item from cart'));
       })
     );
   }

  // Helper to update local state from the backend's simple cart structure
  private _updateStateFromBackendCart(backendCart: { [productId: string]: number }): void {
    let totalItems = 0;
    const newItems: CartItem[] = [];

    for (const productId in backendCart) {
      if (backendCart.hasOwnProperty(productId)) {
        const quantity = backendCart[productId];
        totalItems += quantity;
        // Create partial CartItem - missing full product details!
        newItems.push({
          product: { id: productId } as Product, // Cast as Product, but only ID is known
          quantity: quantity
        });
      }
    }

    this.cartStateSubject.next({ items: newItems, totalItems: totalItems });
    console.log('Cart state updated from backend response:', this.cartStateSubject.getValue()); // Replaced logger
  }

}
