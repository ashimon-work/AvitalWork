import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { Observable, combineLatest, switchMap, tap, catchError, of } from 'rxjs';
import { Order, Product } from '@shared-types';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './order-confirmation-page.component.html',
  styleUrl: './order-confirmation-page.component.scss'
})
export class OrderConfirmationPageComponent implements OnInit {
  orderId: string | null = null;
  order$: Observable<Order | null>;
  recommendedProducts$: Observable<Product[]>;
  isLoadingOrder: boolean = true;
  isLoadingRecommended: boolean = true;
  storeSlug: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private storeContextService: StoreContextService
  ) {
    // Initialize observables, but data fetching happens in ngOnInit
    this.order$ = of(null);
    this.recommendedProducts$ = of([]);
  }

  ngOnInit(): void {
    this.storeContextService.currentStoreSlug$.subscribe(slug => {
      this.storeSlug = slug;
    });

    this.orderId = this.route.snapshot.paramMap.get('id');

    if (this.orderId) {
      this.isLoadingOrder = true;
      this.order$ = this.apiService.getUserOrderDetails(this.orderId).pipe(
        tap(() => this.isLoadingOrder = false),
        catchError(error => {
          console.error('Error fetching order details:', error);
          this.isLoadingOrder = false;
          // TODO: Display error message or redirect to a different page
          return of(null); // Return null on error
        })
      );

      this.isLoadingRecommended = true;
      this.recommendedProducts$ = this.apiService.getRecommendedProducts(this.orderId).pipe(
        tap(() => this.isLoadingRecommended = false),
        catchError(error => {
          console.error('Error fetching recommended products:', error);
          this.isLoadingRecommended = false;
          return of([]); // Return empty array on error
        })
      );

    } else {
      console.error('Order ID not found in route parameters.');
      this.isLoadingOrder = false;
      this.isLoadingRecommended = false;
      // TODO: Redirect to homepage or show an error message
      this.router.navigate(['/', this.storeSlug || '']); // Redirect to store homepage
    }
  }

  continueShopping(): void {
    this.router.navigate(['/', this.storeSlug || '']); // Redirect to store homepage
  }

  goToMyAccount(): void {
    this.router.navigate(['/', this.storeSlug || '', 'account', 'orders']); // Redirect to user's orders page
  }
}
