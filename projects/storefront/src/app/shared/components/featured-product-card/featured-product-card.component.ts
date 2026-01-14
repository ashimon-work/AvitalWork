import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '@shared-types';
import { RouterModule } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';
@Component({
  selector: 'app-featured-product-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, TranslatePipe],
  templateUrl: './featured-product-card.component.html',
  styleUrl: './featured-product-card.component.scss'
})
export class FeaturedProductCardComponent {
  @Input() product!: Product;
  @Input() storeSlug: string | null = null;

  @Output() addToCart = new EventEmitter<Product>(); // Emit Product

  public favorite: boolean = false;
  public tKeys = T; // Translation keys
  get href(): string {
    if (this.storeSlug && this.product) {
      return `/${this.storeSlug}/product/${this.product.id}`;
    }
    // Fallback or default link
    return '/products';
  }

  get imageUrl(): string {
    return (this.product && this.product.imageUrls && this.product.imageUrls.length > 0)
      ? this.product.imageUrls[0]
      : 'assets/images/placeholder-image.webp';
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
}