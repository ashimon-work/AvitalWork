import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, switchMap, tap, map, of, filter, catchError } from 'rxjs'; // Added filter and catchError
import { Product, Category } from '@shared-types'; // Added Category
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
  product$!: Observable<Product | null>; // Added definite assignment assertion
  category$!: Observable<Category | null>; // Added definite assignment assertion
  quantity: number = 1;

  constructor(private activatedRoute: ActivatedRoute) {
    this.categoryId$ = this.activatedRoute.queryParamMap.pipe(
      map(params => params.get('categoryId'))
    );
  }

  ngOnInit(): void {
    // Fetch Product Details
    this.product$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id), // Ensure id is not null/undefined
      tap(id => {
        if (!id) { // Double check, though filter should prevent this
          console.error('Product ID missing from route');
          this.router.navigate(['/']);
        }
      }),
      switchMap(id => this.apiService.getProductDetails(id).pipe(
        tap(product => {
          if (!product) {
            console.error(`Product with ID ${id} not found`);
            this.router.navigate(['/not-found']); // Redirect if product not found
          }
        }),
        catchError((err: any) => { // Added type for err
          console.error('Error fetching product details:', err);
          this.router.navigate(['/not-found']); // Redirect on error
          return of(null); // Return null observable on error
        })
      ))
    );

    // Fetch Category Details using categoryId$ from constructor
    this.category$ = this.categoryId$.pipe(
      filter((id): id is string => !!id), // Ensure categoryId is not null
      switchMap(categoryId => this.apiService.getCategoryDetails(categoryId).pipe(
        tap(category => {
          if (!category) {
            console.warn(`Category with ID ${categoryId} not found for breadcrumb.`);
            // Don't redirect, maybe just don't show category in breadcrumb
          }
        }),
        catchError((err: any) => { // Added type for err
          console.error('Error fetching category details:', err);
          return of(null); // Return null observable on error, breadcrumb can handle this
        })
      ))
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
