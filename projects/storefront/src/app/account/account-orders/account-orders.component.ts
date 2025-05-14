import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, OrderDto, PaginatedOrders } from '../../core/services/api.service';
import { Observable, BehaviorSubject, switchMap, tap, map, shareReplay, withLatestFrom, of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { StoreContextService } from '../../core/services/store-context.service';

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-orders.component.html',
  styleUrls: ['./account-orders.component.scss']
})
export class AccountOrdersComponent implements OnInit {
  private apiService = inject(ApiService);
  private storeContextService = inject(StoreContextService);

  // Pagination state
  currentPage$ = new BehaviorSubject<number>(1);
  currentPage: number = 1;
  itemsPerPage = 10;

  // Observable for paginated orders
  paginatedOrders$: Observable<PaginatedOrders>;
  orders$: Observable<OrderDto[]>;
  totalOrders$: Observable<number>;
  totalPages$: Observable<number>;

  isLoading = false;

  constructor(private cdr: ChangeDetectorRef) {
    this.paginatedOrders$ = this.currentPage$.pipe(
      withLatestFrom(this.storeContextService.currentStoreSlug$),
      tap(() => {
        this.isLoading = true;
        this.cdr.detectChanges();
      }),
      switchMap(([page, storeSlug]) => {
        if (!storeSlug) {
          console.error('AccountOrdersComponent: Store slug is not available.');
          // Optionally, return an empty observable or throw an error to prevent API call
          return of({ orders: [], total: 0 } as PaginatedOrders);
        }
        return this.apiService.getUserOrders(page, this.itemsPerPage, storeSlug);
      }),
      tap(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
      shareReplay(1) // Cache the last emission
    );

    this.orders$ = this.paginatedOrders$.pipe(map(result => result.orders));
    this.totalOrders$ = this.paginatedOrders$.pipe(map(result => result.total));
    this.totalPages$ = this.totalOrders$.pipe(
      map(total => Math.ceil(total / this.itemsPerPage))
    );

    // Subscribe to keep currentPage number updated
    this.currentPage$.subscribe(page => this.currentPage = page);
  }

  ngOnInit(): void {
    // Trigger initial load if storeSlug is already available,
    // or rely on withLatestFrom to wait for it.
    // For robustness, you might want to ensure storeSlug is present before initial subscription
    // or handle it within the pipe. withLatestFrom handles this by only emitting when both have a value.
    // Initial fetch triggered by observable setup
  }

  // Method to go to a specific page
  goToPage(page: number): void {
    // Add checks to prevent going out of bounds if needed, though UI should handle disabling
    this.currentPage$.next(page);
  }
}

// viewOrderDetails method is no longer needed as navigation is handled by routerLink
// viewOrderDetails(orderId: string): void {
//   console.log('Navigate to order details for:', orderId);
//   // Example: this.router.navigate(['/account/orders', orderId]);
// }

