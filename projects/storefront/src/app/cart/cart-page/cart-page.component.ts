import { Component, inject, OnInit } from '@angular/core'; // Added OnInit
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, firstValueFrom, take, of, switchMap, map } from 'rxjs'; // Added of, switchMap, map
import { CartService, CartState, CartItem } from '../../core/services/cart.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { ApiService } from '../../core/services/api.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service'; // Added import
import { Product } from '@shared-types';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component'; // Added import

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductCardComponent // Added to imports
  ],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent implements OnInit { // Implemented OnInit
  private cartService = inject(CartService);
  private storeContextService = inject(StoreContextService);
  private location = inject(Location);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private recentlyViewedService = inject(RecentlyViewedService); // Added injection

  promoCode: string = '';
  appliedPromoCodeDetails: { code: string, discountAmount: number, message?: string } | null = null;

  // Expose the cart state observable directly to the template
  cartState$: Observable<CartState | null> = this.cartService.cartState$;
  // Expose the store slug observable
  currentStoreSlug$: Observable<string | null> = this.storeContextService.currentStoreSlug$;
  recentlyViewedProducts$: Observable<Product[]> = of([]); // Added property

  ngOnInit(): void {
    const productIds = this.recentlyViewedService.getRecentlyViewedProductIds();
    if (productIds.length > 0) {
      this.recentlyViewedProducts$ = this.currentStoreSlug$.pipe(
        take(1),
        switchMap(storeSlug => {
          if (storeSlug) {
            return this.apiService.getProductsByIds(storeSlug, productIds);
          }
          return of([]); // No store slug, return empty
        })
      );
    }
  }

  // Method to calculate item subtotal
  calculateItemSubtotal(item: CartItem): number {
    // Need to handle the case where product details might be missing initially
    // This assumes the product object on CartItem will eventually be populated
    // or the price is fetched/available somehow.
    // For now, using a placeholder or assuming price exists if item exists.
    // A better approach might involve fetching product details if needed.
    const price = item.product?.price || 0; // Use 0 if price is missing
    return price * item.quantity;
  }

  // Method to calculate cart subtotal
  calculateCartSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + this.calculateItemSubtotal(item), 0);
  }

  // Method to handle quantity updates from the input
  updateQuantity(item: CartItem, quantityString: string): void {
    const newQuantity = parseInt(quantityString, 10);
    // Basic validation
    if (isNaN(newQuantity) || newQuantity < 0) {
      console.warn(`Invalid quantity input: ${quantityString}.`);
      // TODO: Reset input to current quantity?
      return;
    }

    if (newQuantity === 0) {
      // Treat setting quantity to 0 as removing the item
      this.removeItem(item);
    } else if (item.product?.id) { // Ensure product ID exists
      this.cartService.updateItemQuantity(item.product.id, newQuantity).subscribe({
         next: () => console.log('Quantity update request sent.'),
         error: (err) => console.error('Error updating quantity:', err)
         // State update is handled within the service
       });
    } else {
      console.error('Cannot update quantity, product ID missing from item:', item);
    }
  }

  // Method to handle removing an item
  removeItem(item: CartItem): void {
    if (item.product?.id) { // Ensure product ID exists
      this.cartService.removeItem(item.product.id).subscribe({
         next: () => console.log('Remove item request sent.'),
         error: (err) => console.error('Error removing item:', err)
         // State update is handled within the service
       });
    } else {
       console.error('Cannot remove item, product ID missing from item:', item);
    }
  }

  // Placeholder method for "Update Cart" button (might not be needed)
  updateCart(): void {
    console.log('Update Cart button clicked. Logic might be handled by quantity changes directly.');
    // Potentially useful if batching updates or recalculating totals explicitly
  }

  applyPromoCode(): void {
    if (!this.promoCode.trim()) {
      this.appliedPromoCodeDetails = {
        code: '',
        discountAmount: 0,
        message: 'Please enter a promo code.'
      };
      return;
    }

    this.storeContextService.currentStoreSlug$.pipe(take(1)).subscribe(storeSlug => {
      if (!storeSlug) {
        console.error('Store slug is not available. Cannot apply promo code.');
        this.appliedPromoCodeDetails = {
          code: this.promoCode,
          discountAmount: 0,
          message: 'Error: Store context not found.'
        };
        return;
      }

      this.apiService.applyPromoCodeToCart(storeSlug, this.promoCode).subscribe({
        next: (response) => {
          // Assuming API response: { success: boolean, code: string, discountAmount: number, message?: string, newTotal?: number }
          if (response && response.success) {
            this.appliedPromoCodeDetails = {
              code: response.code,
              discountAmount: response.discountAmount,
              message: response.message || `Promo code "${response.code}" applied successfully! You saved ${response.discountAmount}.`
            };
            this.promoCode = ''; // Clear input on success
          } else {
            this.appliedPromoCodeDetails = {
              code: this.promoCode,
              discountAmount: 0,
              message: response.message || 'Invalid or expired promo code.'
            };
          }
        },
        error: (err) => {
          console.error('Error applying promo code:', err);
          this.appliedPromoCodeDetails = {
            code: this.promoCode,
            discountAmount: 0,
            message: 'Invalid or expired promo code. Please try again.' // More generic error for UI
          };
        }
      });
    });
  }

  // Placeholder method for "Proceed to Checkout" button
  async proceedToCheckout(): Promise<void> {
    console.log('Proceeding to checkout...');
    const storeSlug = await firstValueFrom(this.storeContextService.currentStoreSlug$);
    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'checkout']);
    } else {
      console.error('Store slug is not available. Cannot navigate to checkout.');
      // Optionally, navigate to a generic error page or home
      this.router.navigate(['/']);
    }
  }

  // Method to navigate back
  goBack(): void {
    this.location.back();
  }
}
