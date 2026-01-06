import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Observable, Subscription, map } from 'rxjs';
import { CurrencyPipe } from '@angular/common';

import { CartService } from '../../../core/services/cart.service';
import { CartDrawerService } from '../../../core/services/cart-drawer.service';
import { StoreContextService } from '../../../core/services/store-context.service';
import { Cart, CartItem } from '@shared-types';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, TranslatePipe],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss',
})
export class CartDrawerComponent implements OnInit, OnDestroy {
  public tKeys = T;

  private cartService = inject(CartService);
  private cartDrawerService = inject(CartDrawerService);
  private storeContextService = inject(StoreContextService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  cart$: Observable<Cart | null> = this.cartService.cartState$;
  itemCount$: Observable<number> = this.cartService.getItemCount();
  isOpen$: Observable<boolean> = this.cartDrawerService.isOpen$;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.subscriptions.push(
      this.isOpen$.subscribe((isOpen) => {
        if (isOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'unset';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    document.body.style.overflow = 'unset';
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDrawer();
    }
  }

  closeDrawer(): void {
    this.cartDrawerService.close();
  }

  incrementQuantity(item: CartItem): void {
    this.cartService
      .updateItemQuantity(item.product.id, item.quantity + 1)
      .subscribe();
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService
        .updateItemQuantity(item.product.id, item.quantity - 1)
        .subscribe();
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeItem(productId).subscribe();
  }

  navigateToCart(): void {
    this.closeDrawer();
    const storeSlug = this.storeContextService.getCurrentStoreSlug();
    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'cart']);
    } else {
      this.router.navigate(['/cart']);
    }
  }

  navigateToCheckout(): void {
    this.closeDrawer();
    const storeSlug = this.storeContextService.getCurrentStoreSlug();
    if (storeSlug) {
      this.router.navigate(['/', storeSlug, 'checkout']);
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  navigateToProducts(): void {
    this.closeDrawer();
    this.router.navigate(['/']);
  }

  getSubtotal(cart: Cart | null): number {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (sum, item) => sum + (item.price || item.product.price) * item.quantity,
      0
    );
  }

  getDiscountAmount(cart: Cart | null): number {
    if (!cart) return 0;
    return cart.discountAmount || 0;
  }

  getTotal(cart: Cart | null): number {
    if (!cart) return 0;
    return cart.grandTotal || this.getSubtotal(cart);
  }

  getProductImage(item: CartItem): string {
    if (item.product.imageUrls && item.product.imageUrls.length > 0) {
      return item.product.imageUrls[0];
    }
    return '';
  }

  getProductPrice(item: CartItem): number {
    return item.price || item.product.price;
  }

  getOriginalPrice(item: CartItem): number | undefined {
    // If the item has a different price than the product price, treat it as a discount
    if (item.price && item.price !== item.product.price) {
      return item.product.price;
    }
    return undefined;
  }
}
