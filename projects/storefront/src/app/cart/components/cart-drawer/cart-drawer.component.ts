import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  HostListener,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Observable, map, Subject, takeUntil } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { CartDrawerService } from '../../../core/services/cart-drawer.service';
import { StoreContextService } from '../../../core/services/store-context.service';
import { Cart, CartItem } from '@shared-types';
import { T, TranslatePipe } from '@shared/i18n';

interface CartItemWithComputed extends CartItem {
  computedImage: string;
  computedPrice: number;
  computedOriginalPrice?: number;
}

interface CartWithComputed extends Omit<Cart, 'items'> {
  items: CartItemWithComputed[];
  computedSubtotal: number;
  computedDiscountAmount: number;
  computedTotal: number;
}

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

  cart$: Observable<CartWithComputed | null> = this.cartService.cartState$.pipe(
    map((cart) => {
      if (!cart || !cart.items) {
        return null;
      }
      // Sort items by ID to maintain consistent ordering when cart is updated
      const sortedItems = [...cart.items].sort((a, b) =>
        a.id.localeCompare(b.id)
      );
      const itemsWithComputed = sortedItems.map((item) => ({
        ...item,
        computedImage: item.product.imageUrls?.[0] ?? '',
        computedPrice: item.price || item.product.price,
        computedOriginalPrice:
          item.price && item.price !== item.product.price
            ? item.product.price
            : undefined,
      }));
      const computedSubtotal = itemsWithComputed.reduce(
        (sum, item) => sum + item.computedPrice * item.quantity,
        0
      );
      const computedDiscountAmount = cart.discountAmount || 0;
      const computedTotal = cart.grandTotal || computedSubtotal;
      return {
        ...cart,
        items: itemsWithComputed,
        computedSubtotal,
        computedDiscountAmount,
        computedTotal,
      };
    })
  );
  itemCount$: Observable<number> = this.cartService.getItemCount();
  isOpen$: Observable<boolean> = this.cartDrawerService.isOpen$;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.isOpen$.pipe(takeUntil(this.destroy$)).subscribe((isOpen) => {
      document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateItemQuantity(item.id, item.quantity + 1).subscribe({
      error: (error: any) => {
        console.error('Error updating item quantity:', error);
      },
    });
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService
        .updateItemQuantity(item.id, item.quantity - 1)
        .subscribe({
          error: (error: any) => {
            console.error('Error updating item quantity:', error);
          },
        });
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeItem(productId).subscribe({
      error: (error: any) => {
        console.error('Error removing item from cart:', error);
      },
    });
  }

  navigateToCart(): void {
    this.closeDrawer();
    const storeSlug = this.storeContextService.getCurrentStoreSlug();
    this.router.navigate(storeSlug ? ['/', storeSlug, 'cart'] : ['/cart']);
  }

  navigateToCheckout(): void {
    this.closeDrawer();
    const storeSlug = this.storeContextService.getCurrentStoreSlug();
    this.router.navigate(
      storeSlug ? ['/', storeSlug, 'checkout'] : ['/checkout']
    );
  }

  navigateToProducts(): void {
    this.closeDrawer();
    this.router.navigate(['/']);
  }
}
