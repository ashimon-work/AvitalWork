import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, combineLatest, BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, startWith, map } from 'rxjs/operators';

import { OrderService } from '../../order/order.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { NotificationService } from '../../core/services/notification.service';
import { Order, OrderListResponse, OrderQueryParams } from '@shared-types';
import { OrderDetailsModalComponent } from '../components/order-details-modal/order-details-modal.component';
import { T, TranslatePipe, I18nService, TranslationKey } from '@shared/i18n';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let bootstrap: any; // Declare bootstrap for type usage

@Component({
  selector: 'app-order-management-page',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderDetailsModalComponent, TranslatePipe],
  templateUrl: './order-management-page.component.html',
  styleUrl: './order-management-page.component.scss'
})
export class OrderManagementPageComponent implements OnInit, OnDestroy {
  public tKeys = T;
  orders: Order[] = [];
  totalOrders: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;
  error: any = null;
  isExporting: boolean = false;

  // Public properties for template binding (synchronized with Subjects)
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedDateRange: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  sortColumn: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination properties
  private pageSubject = new BehaviorSubject<number>(1);
  private pageSizeSubject = new BehaviorSubject<number>(10);

  // Sorting properties
  private sortColumnSubject = new BehaviorSubject<string>('createdAt');
  private sortDirectionSubject = new BehaviorSubject<'asc' | 'desc'>('desc');

  // Filtering properties
  private statusFilterSubject = new BehaviorSubject<string>('');
  private dateRangeFilterSubject = new BehaviorSubject<string>('');
  private searchTermSubject = new Subject<string>();

  // Combined query parameters observable
  private queryParams$: Observable<OrderQueryParams>;
  private ordersSubscription: Subscription | undefined;
  private subscriptions: Subscription[] = []; // To manage subscriptions for syncing public properties

  selectedOrder: Order | null = null;

  constructor(
    private orderService: OrderService,
    private storeContextService: StoreContextService,
    private notificationService: NotificationService,
    private i18nService: I18nService
  ) {
    // Combine all relevant observables to form the query parameters
    this.queryParams$ = combineLatest([
      this.pageSubject.asObservable().pipe(startWith(1)),
      this.pageSizeSubject.asObservable().pipe(startWith(10)),
      this.sortColumnSubject.asObservable().pipe(startWith('createdAt')),
      this.sortDirectionSubject.asObservable().pipe(startWith('desc')),
      this.statusFilterSubject.asObservable().pipe(startWith('')),
      this.dateRangeFilterSubject.asObservable().pipe(startWith('')),
      this.searchTermSubject.asObservable().pipe(debounceTime(500), distinctUntilChanged(), startWith(''))
    ]).pipe(
      map(([page, pageSize, sortBy, sortDirection, status, dateRange, search]) => ({
        page,
        pageSize,
        sortBy,
        sortDirection,
        status,
        startDate: dateRange ? this.getDateRangeStart(dateRange) : undefined,
        endDate: dateRange ? this.getDateRangeEnd(dateRange) : undefined,
        search
      } as OrderQueryParams))
    );
  }

  ngOnInit(): void {
    // Sync public properties with Subject values for template binding
    this.subscriptions.push(this.pageSubject.subscribe(page => this.currentPage = page));
    this.subscriptions.push(this.pageSizeSubject.subscribe(pageSize => this.pageSize = pageSize));
    this.subscriptions.push(this.sortColumnSubject.subscribe(column => this.sortColumn = column));
    this.subscriptions.push(this.sortDirectionSubject.subscribe(direction => this.sortDirection = direction));
    this.subscriptions.push(this.statusFilterSubject.subscribe(status => this.selectedStatus = status));
    this.subscriptions.push(this.dateRangeFilterSubject.subscribe(dateRange => this.selectedDateRange = dateRange));
    this.subscriptions.push(this.searchTermSubject.subscribe(term => this.searchTerm = term));


    // Subscribe to the combined query parameters and the store slug to fetch orders
    this.ordersSubscription = combineLatest([
      this.storeContextService.currentStoreSlug$,
      this.queryParams$
    ]).pipe(
      tap(() => {
        this.isLoading = true;
        this.error = null; // Clear previous errors
      }),
      switchMap(([storeSlug, params]) => {
        if (!storeSlug) {
          console.warn('Store slug not available, skipping order fetch.');
          this.isLoading = false;
          return new Observable<OrderListResponse>(); // Return empty observable
        }
        return this.orderService.getManagerOrders(storeSlug, params).pipe(
          catchError(err => {
            this.error = err;
            this.isLoading = false;
            console.error('Error fetching orders:', err);
            this.notificationService.showError(
              this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_FETCH_ORDERS_FAILED_MESSAGE),
              this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_FETCH_ORDERS_FAILED_TITLE)
            );
            return new Observable<OrderListResponse>(); // Return empty observable on error
          })
        );
      })
    ).subscribe(response => {
      if (response && response.orders) {
        this.orders = response.orders;
        this.totalOrders = response.totalCount;
        // Calculate totalPages based on totalOrders and current pageSize value
        const currentSize = this.pageSizeSubject.value;
        this.totalPages = Math.ceil(this.totalOrders / currentSize);
      } else if (!this.error) { // Avoid overwriting specific error messages
        this.orders = [];
        this.totalOrders = 0;
        this.totalPages = 0;
      }
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.pageSubject.complete();
    this.pageSizeSubject.complete();
    this.sortColumnSubject.complete();
    this.sortDirectionSubject.complete();
    this.statusFilterSubject.complete();
    this.dateRangeFilterSubject.complete();
    this.searchTermSubject.complete();
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTermSubject.next(searchTerm);
    // pageSubject is reset to 1 in the queryParams$ pipe due to searchTerm$ emitting
  }

  onStatusFilterChange(status: string): void {
    this.statusFilterSubject.next(status);
    this.pageSubject.next(1); // Reset to first page on filter change
  }

  onDateRangeChange(dateRange: string): void {
    this.dateRangeFilterSubject.next(dateRange);
    this.pageSubject.next(1); // Reset to first page on filter change
  }

  onPageChange(page: number): void {
    this.pageSubject.next(page);
  }

  sortOrders(column: string): void {
    if (this.sortColumnSubject.value === column) {
      const newDirection = this.sortDirectionSubject.value === 'asc' ? 'desc' : 'asc';
      this.sortDirectionSubject.next(newDirection);
    } else {
      this.sortColumnSubject.next(column);
      this.sortDirectionSubject.next('asc'); // Default to ascending when changing column
    }
    this.pageSubject.next(1); // Reset to first page on sort change
  }

  public get paginationSummaryText(): string {
    const start = this.totalOrders > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
    const end = Math.min(start + this.pageSize - 1, this.totalOrders);
    return this.i18nService.translate(T.SM_ORDER_MGMT_PAGE_PAGINATION_SUMMARY, { start, end, total: this.totalOrders });
  }

  // Helper methods to parse date range string
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private getDateRangeStart(dateRange: string): string | undefined {
    if (!dateRange || dateRange === 'all') {
      return undefined;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    switch (dateRange) {
      case 'today':
        return this.formatDate(today);
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return this.formatDate(yesterday);
      case 'last7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // Including today, so 6 days back
        return this.formatDate(sevenDaysAgo);
      case 'last30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29); // Including today
        return this.formatDate(thirtyDaysAgo);
      case 'thisMonth':
        const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return this.formatDate(firstDayThisMonth);
      case 'lastMonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return this.formatDate(firstDayLastMonth);
      default:
        if (dateRange.startsWith('custom_')) {
          const dates = dateRange.substring('custom_'.length).split('_');
          if (dates.length === 2 && dates[0]) {
            // Validate YYYY-MM-DD format
            if (/^\d{4}-\d{2}-\d{2}$/.test(dates[0])) {
              return dates[0];
            }
          }
        }
        console.warn(`getDateRangeStart: Unknown or invalid dateRange format: ${dateRange}`);
        return undefined;
    }
  }

  private getDateRangeEnd(dateRange: string): string | undefined {
    if (!dateRange || dateRange === 'all') {
      return undefined;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // Normalize to end of day for ranges ending 'today'

    switch (dateRange) {
      case 'today':
        return this.formatDate(today); // End of today
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1); // Yesterday
        yesterday.setHours(23,59,59,999); // End of yesterday
        return this.formatDate(yesterday);
      case 'last7days':
      case 'last30days':
        return this.formatDate(today); // End of today for these ranges
      case 'thisMonth':
        const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
        return this.formatDate(lastDayThisMonth);
      case 'lastMonth':
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
        return this.formatDate(lastDayLastMonth);
      default:
        if (dateRange.startsWith('custom_')) {
          const dates = dateRange.substring('custom_'.length).split('_');
          if (dates.length === 2 && dates[1]) {
            // Validate YYYY-MM-DD format
             if (/^\d{4}-\d{2}-\d{2}$/.test(dates[1])) {
              return dates[1];
            }
          }
        }
        console.warn(`getDateRangeEnd: Unknown or invalid dateRange format: ${dateRange}`);
        return undefined;
    }
  }

  openOrderDetailsModal(order: Order): void {
    this.isLoading = true;
    this.error = null;
    this.storeContextService.currentStoreSlug$.subscribe(storeSlug => {
      if (storeSlug && order.id) {
        this.orderService.getManagerOrderDetails(storeSlug, order.id).subscribe({
          next: (orderDetails) => {
            this.selectedOrder = orderDetails;
            this.isLoading = false;
            const modalElement = document.getElementById('orderDetailsModal');
            if (modalElement) {
              const modalInstance = new bootstrap.Modal(modalElement);
              modalInstance.show();
            } else {
              this.notificationService.showError(
                this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_MODAL_NOT_FOUND_MESSAGE),
                this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_MODAL_NOT_FOUND_TITLE)
              );
            }
          },
          error: (err) => {
            this.error = err;
            this.isLoading = false;
            console.error('Error fetching order details:', err);
            this.notificationService.showError(
              this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_FETCH_DETAILS_FAILED_MESSAGE),
              this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_FETCH_ORDERS_FAILED_TITLE) // Re-use title
            );
          }
        });
      } else {
        console.warn('Store slug or Order ID not available, cannot fetch order details.');
        this.notificationService.showWarning(
          this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_FETCH_DETAILS_MISSING_INFO_MESSAGE),
          this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_FETCH_DETAILS_MISSING_INFO_TITLE)
        );
        this.isLoading = false;
      }
    });
  }

  closeModal(): void {
    const modalElement = document.getElementById('orderDetailsModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    this.selectedOrder = null;
  }

  handleOrderUpdated(): void {
    this.notificationService.showSuccess(
      this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_ORDER_UPDATED_SUCCESS_MESSAGE),
      this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_ORDER_UPDATED_SUCCESS_TITLE)
    );
    this.fetchOrders(); // Refresh the order list
    this.closeModal(); // Close modal after update
  }

  private fetchOrders(): void {
    // Trigger a refetch by pushing the current page value again
    this.pageSubject.next(this.pageSubject.value);
  }

  // TODO: Add methods for other user actions like generating packing slip, adding tracking, etc. - Some are in modal

  exportOrders(): void {
    this.isExporting = true;
    this.error = null; // Clear previous errors

    this.storeContextService.currentStoreSlug$.subscribe(storeSlug => {
      if (!storeSlug) {
        console.warn('Store slug not available, cannot export orders.');
        this.notificationService.showError(
          this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_EXPORT_MISSING_STORE_MESSAGE),
          this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_EXPORT_MISSING_STORE_TITLE)
        );
        this.isExporting = false;
        return;
      }

      // Get current filtering/sorting parameters from the component's state (Subjects)
      const currentQueryParams: OrderQueryParams = {
        status: this.statusFilterSubject.value,
        startDate: this.getDateRangeStart(this.selectedDateRange), // Use public property
        endDate: this.getDateRangeEnd(this.selectedDateRange), // Use public property
        search: this.searchTerm, // Use public property
        // Include sorting parameters if backend supports exporting sorted data
        sortBy: this.sortColumn, // Use public property
        sortDirection: this.sortDirection // Use public property
      };

      this.orderService.exportManagerOrders(storeSlug, currentQueryParams).subscribe({
        next: (responseBlob: Blob) => {
          // Use the filename attached to the blob by the service
          const filename = (responseBlob as any).filename || 'orders.csv';

          // Create a download link and trigger click
          const downloadLink = document.createElement('a');
          const url = window.URL.createObjectURL(responseBlob);

          downloadLink.href = url;
          downloadLink.download = filename;
          downloadLink.click();

          window.URL.revokeObjectURL(url); // Clean up the URL object

          this.isExporting = false;
          this.notificationService.showSuccess(
            this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_EXPORT_SUCCESS_MESSAGE),
            this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_EXPORT_SUCCESS_TITLE)
          );
        },
        error: (err) => {
          this.error = err;
          this.isExporting = false;
          console.error('Error exporting orders:', err);
          this.notificationService.showError(
            this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_EXPORT_FAILED_MESSAGE),
            this.i18nService.translate(T.SM_ORDER_MGMT_NOTIF_EXPORT_MISSING_STORE_TITLE) // Re-use title
          );
        }
      });
    });
  }

  getOrderStatusTranslationKey(status: string): TranslationKey {
    const statusKey = `SM_ORDER_STATUS_${status.toUpperCase()}` as TranslationKey;
    if (this.tKeys[statusKey]) {
      return statusKey;
    }
    console.warn(`Missing translation key for order status: ${status}`);
    return status as TranslationKey; // Fallback, though it might not be a valid key
  }
}