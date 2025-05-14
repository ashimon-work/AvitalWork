import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, WishlistDto, WishlistItemDto } from '../../core/services/api.service';
import { Observable, BehaviorSubject, switchMap, tap, map, shareReplay, of } from 'rxjs';
import { Product } from '@shared-types';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-account-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [HttpClient],
  templateUrl: './account-wishlist.component.html',
  styleUrls: ['./account-wishlist.component.scss']
})
export class AccountWishlistComponent implements OnInit {
  private apiService = inject(ApiService);
  private cartService = inject(CartService);

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
        this.successMessage = 'Item removed from wishlist.';
        this.refreshList(); // Refresh the list after removal
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = err.error?.message || 'Failed to remove item from wishlist.';
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
          this.successMessage = `${item.product.name || 'Item'} added to cart.`;
          // Optionally remove from wishlist after adding to cart
          // this.removeItem(item.id);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || `Failed to add ${item.product.name || 'item'} to cart.`;
          console.error('Error adding item to cart from wishlist:', err);
        }
      });
    } else {
      this.errorMessage = 'Product details are missing, cannot add to cart.';
      console.error('Missing product details for wishlist item:', item.id);
    }
    // Optionally remove from wishlist after adding to cart
    // Removed success message from here, handled in subscribe block
    // Note: Cart count update is handled by CartService globally
  }
}
