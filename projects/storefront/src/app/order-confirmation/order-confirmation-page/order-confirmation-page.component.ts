import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { T, TranslatePipe } from '@shared/i18n';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { Observable, combineLatest, switchMap, tap, catchError, of, map } from 'rxjs';
import { Order, Product, OrderItem } from '@shared-types';
import { OrderDto } from '../../core/services/api.service';
import { FeaturedProductCardComponent } from '../../shared/components/featured-product-card/featured-product-card.component';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { I18nService } from '@shared/i18n';

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FeaturedProductCardComponent, TranslatePipe],
  templateUrl: './order-confirmation-page.component.html',
  styleUrl: './order-confirmation-page.component.scss'
})
export class OrderConfirmationPageComponent implements OnInit {
  public tKeys = T;
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
    private storeContextService: StoreContextService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private i18nService: I18nService
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
        map(orderDto => orderDto ? {
          ...orderDto,
          orderNumber: orderDto.orderReference,
          createdAt: orderDto.orderDate.toString(),
          items: orderDto.items?.map(item => ({
            ...item,
            price: item.pricePerUnit
          })),
          notes: orderDto.notes?.map((note, index) => ({
            id: `note-${index}`,
            note: note,
            createdAt: orderDto.orderDate.toString(),
            createdBy: 'system'
          }))
        } as Order : null),
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

  onAddToCart(product: Product): void {
    if (!product || !product.id) {
      console.error('Invalid product data received for AddToCart:', product);
      this.notificationService.showError(this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_ERROR_NOTIFICATION));
      return;
    }

    this.cartService.addItem(product).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_SUCCESS_NOTIFICATION, 1, product.name) // Assuming quantity 1
        );
      },
      error: (error: any) => {
        console.error('Error adding product to cart from order confirmation page:', error);
        this.notificationService.showError(this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_ERROR_NOTIFICATION));
      }
    });
  }
}
