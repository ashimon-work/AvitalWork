import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@shared-types';
import { CartService } from '../../../core/services/cart.service';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    MaterialModule
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  public tKeys = T;
  @Input() product!: Product;
  @Input() storeSlug: string | null = null;
  @Input() categoryId: string | null = null;

  constructor(private cartService: CartService) {}

  // Getter to check if the product is out of stock
  get isOutOfStock(): boolean {
    // Assuming Product interface has a 'stock' property.
    // If product has variants, this might need to check the stock of the default variant
    // or the sum of available variant stocks depending on desired behavior for the card.
    return this.product && this.product.stockLevel !== undefined && this.product.stockLevel <= 0;
  }

  onAddToCart(): void {
    if (this.product && !this.isOutOfStock) {
      console.log('Adding to cart:', this.product.name);
      // Call the service to add the product (or its default variant) to the cart
      // The CartService and backend should handle variant selection if applicable
      this.cartService.addItem(this.product).subscribe({
        next: () => console.log(`${this.product.name} added to cart via service`),
        error: (err) => console.error('Failed to add item via service:', err)
      });
    } else if (this.isOutOfStock) {
      console.warn('Cannot add out-of-stock product to cart:', this.product?.name);
      // Optionally show a notification to the user
    } else {
      console.error('Product data is missing, cannot add to cart.');
    }
  }
}
