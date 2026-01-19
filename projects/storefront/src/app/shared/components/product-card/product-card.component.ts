import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@shared-types';
import { CartService } from '../../../core/services/cart.service';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  public tKeys = T;
  @Input() product!: Product;
  @Input() storeSlug: string | null = null;
  @Input() categoryId: string | null = null;
  @Input() discount?: number;
  @Input() isNew?: boolean;

  constructor(private cartService: CartService) {}

  // Getter to check if the product is out of stock
  get isOutOfStock(): boolean {
    return this.product && this.product.stockLevel !== undefined && this.product.stockLevel <= 0;
  }

  // Calculate original price based on discount percentage
  get originalPrice(): number | undefined {
    if (this.discount && this.discount > 0) {
      return this.product.price / (1 - this.discount / 100);
    }
    return undefined;
  }

  onAddToCart(event: Event): void {
    event.preventDefault(); // Prevent navigation when clicking add to cart
    if (this.product && !this.isOutOfStock) {
      console.log('Adding to cart:', this.product.name);
      this.cartService.addItem(this.product).subscribe({
        next: () => console.log(`${this.product.name} added to cart via service`),
        error: (err) => console.error('Failed to add item via service:', err)
      });
    } else if (this.isOutOfStock) {
      console.warn('Cannot add out-of-stock product to cart:', this.product?.name);
    } else {
      console.error('Product data is missing, cannot add to cart.');
    }
  }
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
    }).format(amount);
  }
}
