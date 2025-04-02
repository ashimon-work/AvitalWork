import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // For async pipe, ngIf, ngFor
import { RouterModule } from '@angular/router'; // For routerLink
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Observable } from 'rxjs';
import { CartService, CartState, CartItem } from '../../core/services/cart.service'; // Import service and interfaces
import { Product } from '@shared-types'; // Import Product type if needed

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // For "Continue Shopping" link
    FormsModule   // Add FormsModule for ngModel
  ],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent {
  private cartService = inject(CartService);

  // Expose the cart state observable directly to the template
  cartState$: Observable<CartState> = this.cartService.cartState$;

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

  // Placeholder method for "Proceed to Checkout" button
  proceedToCheckout(): void {
    console.log('Proceeding to checkout...');
    // TODO: Implement navigation to checkout route
    // this.router.navigate(['/checkout']);
  }
}
