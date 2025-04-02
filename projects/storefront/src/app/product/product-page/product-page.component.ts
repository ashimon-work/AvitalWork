import { Component, OnInit, inject } from '@angular/core'; // Added OnInit, inject
import { CommonModule } from '@angular/common'; // For *ngIf, async pipe etc.
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // For reading route params, navigation, breadcrumbs
import { FormsModule } from '@angular/forms'; // For quantity input [(ngModel)]
import { Observable, switchMap, tap, map } from 'rxjs';
import { Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service'; // Import CartService

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // For breadcrumbs routerLink
    FormsModule   // For quantity ngModel
  ],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.scss'
})
export class ProductPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cartService = inject(CartService); // Inject CartService

  product$: Observable<Product | null> | undefined;
  quantity: number = 1; // Default quantity

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      tap(id => {
        if (!id) {
          console.error('Product ID missing from route');
          this.router.navigate(['/']); // Redirect if no ID
        }
      }),
      switchMap(id => {
        if (!id) {
          return new Observable<Product | null>(subscriber => subscriber.next(null)); // Return null observable if no ID
        }
        return this.apiService.getProductDetails(id).pipe(
          tap(product => {
            if (!product) {
              console.error(`Product with ID ${id} not found`);
              this.router.navigate(['/not-found']); // Redirect if product not found
            }
          })
        );
      })
    );
  }

  // Method to handle adding to cart
  onAddToCart(product: Product | null): void {
    if (!product) {
      console.error('Cannot add null product to cart');
      return;
    }
    if (this.quantity < 1) {
      console.warn('Quantity must be at least 1');
      this.quantity = 1; // Reset quantity if invalid
      // Optionally show user feedback
      return;
    }
    console.log(`Adding ${this.quantity} of ${product.name} to cart`);
    this.cartService.addItem(product, this.quantity).subscribe({
      next: () => {
        console.log('Item added successfully via service');
        // TODO: Add user feedback (e.g., toast notification, button state change)
      },
      error: (err) => {
        console.error('Failed to add item via service:', err);
        // TODO: Add user feedback
      }
    });
  }

  // TODO: Add methods for variant selection, quantity adjustment limits based on stock, etc.
}
