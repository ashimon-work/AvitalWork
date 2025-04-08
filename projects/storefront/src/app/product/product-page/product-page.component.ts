import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, switchMap, tap, map, of } from 'rxjs';
import { Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { StoreContextService } from '../../core/services/store-context.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.scss'
})
export class ProductPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cartService = inject(CartService);
  private storeContext = inject(StoreContextService);
  public currentStoreSlug$ = this.storeContext.currentStoreSlug$;
  categoryId$: Observable<string | null>;
  product$: Observable<Product | null> | undefined;
  quantity: number = 1;

  constructor(private activatedRoute: ActivatedRoute) {
    this.categoryId$ = this.activatedRoute.queryParamMap.pipe(
      map(params => params.get('categoryId'))
    );
  }

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      tap(id => {
        if (!id) {
          console.error('Product ID missing from route');
          this.router.navigate(['/']);
        }
      }),
      switchMap(id => {
        if (!id) {
          return of(null);
        }
        return this.apiService.getProductDetails(id).pipe(
          tap(product => {
            if (!product) {
              console.error(`Product with ID ${id} not found`);
              this.router.navigate(['/not-found']);
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
