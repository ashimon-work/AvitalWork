import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@shared-types';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() storeSlug: string | null = null;
  @Input() categoryId: string | null = null;

  constructor(private cartService: CartService) {}

  onAddToCart(): void {
    if (this.product) {
      console.log('Adding to cart:', this.product.name);
      // Call the service - handle potential errors/success feedback if needed
      this.cartService.addItem(this.product).subscribe({
        next: () => console.log(`${this.product.name} added to cart via service`),
        error: (err) => console.error('Failed to add item via service:', err)
      });
    } else {
      console.error('Product data is missing, cannot add to cart.');
    }
  }
}
