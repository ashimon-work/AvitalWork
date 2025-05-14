import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, OrderDto, PaginatedOrders } from '../../core/services/api.service'; // Import service and DTOs
import { Observable, BehaviorSubject, switchMap, tap, map, shareReplay } from 'rxjs';
import { RouterModule } from '@angular/router'; // Import for potential links

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule
  templateUrl: './account-orders.component.html',
  styleUrls: ['./account-orders.component.scss'] // Corrected property name
})
export class AccountOrdersComponent implements OnInit {
  private apiService = inject(ApiService);

  // Pagination state
  currentPage$ = new BehaviorSubject<number>(1); // Make public
  currentPage: number = 1; // Store current page number
  itemsPerPage = 10; // Or get from config

  // Observable for paginated orders
  paginatedOrders$: Observable<PaginatedOrders>;
  orders$: Observable<OrderDto[]>;
  totalOrders$: Observable<number>;
  totalPages$: Observable<number>; // Add observable for total pages

  isLoading = false;

  constructor() {
    this.paginatedOrders$ = this.currentPage$.pipe(
      tap(() => this.isLoading = true),
      switchMap(page => this.apiService.getUserOrders(page, this.itemsPerPage)),
      tap(() => this.isLoading = false),
      shareReplay(1) // Cache the last emission
    );

    this.orders$ = this.paginatedOrders$.pipe(map(result => result.orders));
    this.totalOrders$ = this.paginatedOrders$.pipe(map(result => result.total));
    this.totalPages$ = this.totalOrders$.pipe(
      map(total => Math.ceil(total / this.itemsPerPage)) // Calculate total pages
    );

    // Subscribe to keep currentPage number updated
    this.currentPage$.subscribe(page => this.currentPage = page);
  }

  ngOnInit(): void {
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

