import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, WishlistDto, WishlistItemDto } from '../../core/services/api.service';
import { Observable, BehaviorSubject, switchMap, tap, map, shareReplay, of } from 'rxjs';
import { Product } from '@shared-types';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { HttpClient } from '@angular/common/http';
import { T, I18nService } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-account-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  providers: [HttpClient],
  templateUrl: './account-wishlist.component.html',
  styleUrls: ['./account-wishlist.component.scss']
})
export class AccountWishlistComponent implements OnInit {
  private apiService = inject(ApiService);
  private cartService = inject(CartService);
  private i18nService = inject(I18nService);

  public tKeys = T;

  private refreshWishlist$ = new BehaviorSubject<void>(undefined); // Trigger to refresh list
  wishlist$: Observable<WishlistDto | null>;
  items$: Observable<WishlistItemDto[]>;

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null; // For add/remove feedback

  constructor(private cdr: ChangeDetectorRef) {
    this.wishlist$ = this.refreshWishlist$.pipe(
      tap(() => {
        this.isLoading = true;
        this.clearMessages(); // Clear messages on refresh
        this.cdr.detectChanges();
      }),
      switchMap(() => this.apiService.getUserWishlist()),
      tap(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
      shareReplay(1) // Cache the last emission
    );

    this.items$ = this.wishlist$.pipe(
      map(wishlist => wishlist?.items || []) // Extract items or return empty array
    );
  }

  ngOnInit(): void {
    // Initial fetch triggered by observable setup
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  private refreshList(): void {
    this.refreshWishlist$.next();
  }

  removeItem(itemId: string | undefined): void {
    if (!itemId) return;
    this.clearMessages();
    this.isLoading = true; // Indicate loading during removal
    this.cdr.detectChanges();
    this.apiService.removeItemFromWishlist(itemId).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.successMessage = this.i18nService.translate(this.tKeys.SF_ACCOUNT_WISHLIST_REMOVE_SUCCESS);
        this.refreshList(); // Refresh the list after removal
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = err.error?.message || this.i18nService.translate(this.tKeys.SF_ACCOUNT_WISHLIST_REMOVE_ERROR);
        console.error('Error removing wishlist item:', err);
      }
    });
  }

  addToCart(item: WishlistItemDto): void {
    this.clearMessages();
    // Assuming quantity 1 when adding from wishlist
    // Ensure item.product is not undefined before passing
    if (item.product) {
      // Cast Partial<Product> to Product; CartService might need adjustment if full Product is strictly required
      this.cartService.addItem(item.product as Product, 1).subscribe({
        next: () => {
          const productName = item.product.name;
          if (productName) {
            this.successMessage = this.i18nService.translate(this.tKeys.SF_ACCOUNT_WISHLIST_ADD_TO_CART_SUCCESS, { productName });
          } else {
            this.successMessage = this.i18nService.translate(this.tKeys.SF_ACCOUNT_WISHLIST_ADD_TO_CART_SUCCESS_DEFAULT_ITEM);
          }
          // Optionally remove from wishlist after adding to cart
          // this.removeItem(item.id);
        },
        error: (err) => {
          const productName = item.product.name;
          if (productName) {
            this.errorMessage = err.error?.message || this.i18nService.translate(this.tKeys.SF_ACCOUNT_WISHLIST_ADD_TO_CART_ERROR, { productName });
          } else {
            this.errorMessage = err.error?.message || this.i18nService.translate(this.tKeys.SF_ACCOUNT_WISHLIST_ADD_TO_CART_ERROR_DEFAULT_ITEM);
          }
          console.error('Error adding item to cart from wishlist:', err);
        }
      });
    } else {
      this.errorMessage = this.i18nService.translate(this.tKeys.SF_ACCOUNT_WISHLIST_ADD_TO_CART_MISSING_DETAILS_ERROR);
      console.error('Missing product details for wishlist item:', item.id);
    }
    // Optionally remove from wishlist after adding to cart
    // Removed success message from here, handled in subscribe block
    // Note: Cart count update is handled by CartService globally
  }
}
