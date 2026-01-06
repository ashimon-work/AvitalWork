import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, firstValueFrom, take, of, switchMap } from 'rxjs';
import { CartService, CartState, CartItem } from '../../core/services/cart.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { ApiService } from '../../core/services/api.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { Product } from '@shared-types';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { NotificationService } from '../../core/services/notification.service';
import { I18nService } from '@shared/i18n';


@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductCardComponent,
    TranslatePipe
  ],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent implements OnInit {
  private cartService = inject(CartService);
  private storeContextService = inject(StoreContextService);
  private location = inject(Location);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private recentlyViewedService = inject(RecentlyViewedService);
  private notificationService = inject(NotificationService);
  private i18nService = inject(I18nService);

  public tKeys = T;
  promoCode: string = '';
  appliedPromoCodeDetails: { code: string, discountAmount: number, message?: string } | null = null;

  // Expose the cart state observable directly to the template
  cartState$: Observable<CartState | null> = this.cartService.cartState$;
  // Expose the store slug observable
  currentStoreSlug$: Observable<string | null> = this.storeContextService.currentStoreSlug$;
  recentlyViewedProducts$: Observable<Product[]> = of([]);
  suggestedProducts$: Observable<Product[]> = of([]);

  // New product suggestion (mock data)
  newProductSuggestion: Product = {
    id: '7',
    sku: '7',
    name: 'W&S Little Lion Sculpture',
    description: '',
    price: 49.00,
    imageUrls: ['/assets/images/placeholder.png'],
    categories: [],
    stockLevel: 10,
    isActive: true,
  };

  ngOnInit(): void {
    const productIds = this.recentlyViewedService.getRecentlyViewedProductIds();
    if (productIds.length > 0) {
      this.recentlyViewedProducts$ = this.currentStoreSlug$.pipe(
        take(1),
        switchMap(storeSlug => {
          if (storeSlug) {
            return this.apiService.getProductsByIds(productIds);
          }
          return of([]);
        })
      );
    }
    
    // Fetch featured products for "You may also like these" section
    this.suggestedProducts$ = this.apiService.getFeaturedProducts();
  }
  trackByProductId(index: number, item: CartItem): string {
    return item.product.id;
  }
  // Method to calculate item subtotal
  calculateItemSubtotal(item: CartItem): number {
    const price = item.product?.price || 0;
    return price * item.quantity;
  }

  // Method to calculate cart subtotal
  calculateCartSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + this.calculateItemSubtotal(item), 0);
  }

  // Method to calculate total
  calculateTotal(items: CartItem[]): number {
    const subtotal = this.calculateCartSubtotal(items);
    const discount = this.appliedPromoCodeDetails?.discountAmount || 0;
    return subtotal - discount;
  }

  // Method to handle quantity updates from the input
  updateQuantity(item: CartItem, quantityString: string): void {
    const newQuantity = parseInt(quantityString, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      console.warn(`Invalid quantity input: ${quantityString}.`);
      return;
    }

    if (newQuantity === 0) {
      this.removeItem(item);
    } else if (item.id) { // Ensure item ID exists
      console.log('CartPage: Updating quantity for item:', item);
      console.log('CartPage: Item ID:', item.id);
      console.log('CartPage: Full item object:', JSON.stringify(item));
      this.cartService.updateItemQuantity(item.id, newQuantity).subscribe({
        next: () => console.log('Quantity update request sent.'),
        error: (err: any) => console.error('Error updating quantity:', err)
        // State update is handled within the service
      });
    } else {
      console.error('Cannot update quantity, product ID missing from item:', item);
    }
  }

  incrementQuantity(item: CartItem): void {
    if (item.product?.stockLevel && item.quantity < item.product.stockLevel) {
      this.updateQuantity(item, (item.quantity + 1).toString());
    }
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, (item.quantity - 1).toString());
    }
  }

  // Method to handle removing an item
  removeItem(item: CartItem): void {
    if (item?.id) { // Ensure product ID exists
      this.cartService.removeItem(item.id).subscribe({
        next: () => console.log('Remove item request sent.'),
        error: (err: any) => console.error('Error removing item:', err)
        // State update is handled within the service
      });
    } else {
      console.error('Cannot remove item, product ID missing from item:', item);
    }
  }

  // Apply promo code
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
        next: (response: any) => {
          // Assuming API response: { success: boolean, code: string, discountAmount: number, message?: string, newTotal?: number }
          if (response && response.success) {
            this.appliedPromoCodeDetails = {
              code: response.code,
              discountAmount: response.discountAmount,
              message: response.message || `Promo code "${response.code}" applied successfully! You saved ${response.discountAmount}.`
            };
            this.promoCode = '';
          } else {
            this.appliedPromoCodeDetails = {
              code: this.promoCode,
              discountAmount: 0,
              message: response.message || 'Invalid or expired promo code.'
            };
          }
        },
        error: (err: any) => {
          console.error('Error applying promo code:', err);
          this.appliedPromoCodeDetails = {
            code: this.promoCode,
            discountAmount: 0,
            message: 'Invalid or expired promo code. Please try again.'
          };
        }
      });
    });
  }

  // Proceed to checkout
  async proceedToCheckout(): Promise<void> {
    console.log('Proceeding to checkout...');
    const storeSlug = await firstValueFrom(this.storeContextService.currentStoreSlug$);
    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'checkout']);
    } else {
      console.error('Store slug is not available. Cannot navigate to checkout.');
      this.router.navigate(['/']);
    }
  }

  // Navigate back
  goBack(): void {
    this.location.back();
  }

  // Add suggested product to cart
  onAddSuggestedProductToCart(product: Product): void {
    this.cartService.addItem(product).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_SUCCESS_NOTIFICATION, 1, product.name)
        );
      },
      error: (error: any) => {
        console.error('Error adding suggested product to cart:', error);
        this.notificationService.showError(this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_ERROR_NOTIFICATION));
      }
    });
  }
}
