import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '@shared-types';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { NotificationService } from '../../../core/services/notification.service';
import { T, I18nService, TranslatePipe} from '@shared/i18n';

@Component({
  selector: 'app-featured-product-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, TranslatePipe],
  templateUrl: './featured-product-card.component.html',
  styleUrl: './featured-product-card.component.scss',
})
export class FeaturedProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Input() storeSlug: string | null = null;
  @Output() addToCart = new EventEmitter<Product>(); // Emit Product
  private wishlistService = inject(WishlistService);
  private notificationService = inject(NotificationService);
  private i18nService = inject(I18nService);
  public tKeys = T;

  public favorite: boolean = false;
 
  isInWishlist: boolean = false;

  private cacheBuster = '&t=' + Date.now();

  ngOnInit(): void {
    // Initialize isInWishlist based on whether the product is already in the wishlist
    if (this.product) {
      this.wishlistService.isInWishlist(this.product.id).subscribe({
        next: (inWishlist: boolean) => {
          this.isInWishlist = inWishlist;
        },
        error: (err: any) => {
          console.error('Failed to check if item is in wishlist:', err);
        },
      });
    }
  }
  get productLink(): any[] | null {
    if (this.storeSlug && this.product) {
      return ['/', this.storeSlug, 'product', this.product.id];
    }
    // Fallback or default link
    return null;
  }
  get href(): string {
    if (this.storeSlug && this.product) {
      return `/${this.storeSlug}/product/${this.product.id}`;
    }
    // Fallback or default link
    return '/products';
  }

  get imageUrl(): string {
    const url = (this.product && this.product.imageUrls && this.product.imageUrls.length > 0)
    return this.product &&
      this.product.imageUrls &&
      this.product.imageUrls.length > 0
      ? this.product.imageUrls[0]
      : 'assets/images/placeholder-image.webp';
    console.log('Featured product image URL:', url, 'for product:', this.product?.name);
    const separator = url.includes('?') ? '&' : '?';
    return url + separator + 'v=1';
  }

  get altText(): string {
    return this.product ? `Image of ${this.product.name}` : 'Product image';
  }

  toggleFavorite(): void {
    this.favorite = !this.favorite;
    // Here you would typically call a service to update the favorite status on the backend
  }

  onAddToCartClick(): void {
    this.addToCart.emit(this.product);
  }

  onImageError(event: Event): void {
    console.error('Image failed to load:', (event.target as HTMLImageElement).src);
  }
}
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
    }).format(amount);
  }
}
  // Method to handle adding/removing from wishlist
  toggleWishlist(product: Product | null): void {
    if (!product) {
      console.error('Cannot toggle wishlist: Product is null');
      return;
    }

    if (this.isInWishlist) {
      // Remove from wishlist
      this.wishlistService.removeItem(product.id).subscribe({
        next: () => {
          console.log(`Product ${product.id} removed from wishlist`);
          this.isInWishlist = false;
          this.notificationService.showInfo(
            this.i18nService.translate(
              this.tKeys
                .SF_PRODUCT_PAGE_REMOVE_FROM_WISHLIST_SUCCESS_NOTIFICATION,
              product.name
            )
          );
        },
        error: (err: any) => {
          console.error('Failed to remove item from wishlist:', err);
          this.notificationService.showError(
            this.i18nService.translate(
              this.tKeys.SF_PRODUCT_PAGE_REMOVE_FROM_WISHLIST_ERROR_NOTIFICATION
            )
          );
        },
      });
    } else {
      // Add to wishlist
      this.wishlistService.addItem(product.id).subscribe({
        next: () => {
          console.log(`Product ${product.id} added to wishlist`);
          this.isInWishlist = true;
          this.notificationService.showSuccess(
            this.i18nService.translate(
              this.tKeys.SF_PRODUCT_PAGE_ADD_TO_WISHLIST_SUCCESS_NOTIFICATION,
              product.name
            )
          );
        },
        error: (err: any) => {
          console.error('Failed to add item to wishlist:', err);
          this.notificationService.showError(
            this.i18nService.translate(
              this.tKeys.SF_PRODUCT_PAGE_ADD_TO_WISHLIST_ERROR_NOTIFICATION
            )
          );
        },
      });
    }
  }
}
