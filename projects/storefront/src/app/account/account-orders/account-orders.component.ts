import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, OrderDto, PaginatedOrders, OrderItemDto, AddressDto } from '../../core/services/api.service';
import { Observable, BehaviorSubject, switchMap, tap, map, shareReplay, withLatestFrom, of, startWith } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { StoreContextService } from '../../core/services/store-context.service';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { I18nService } from '@shared/i18n';
import { AccountOrdersSectionComponent } from '../components/account-orders-section/account-orders-section.component';
import { Order, OrderItem } from '@shared-types';
import { OrderStatus } from 'projects/shared-types/src/lib/order.types';

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, AccountOrdersSectionComponent],
  templateUrl: './account-orders.component.html',
  styleUrls: ['./account-orders.component.scss']
})
export class AccountOrdersComponent implements OnInit {
  public tKeys = T;
  private apiService = inject(ApiService);
  private storeContextService = inject(StoreContextService);
  private i18nService = inject(I18nService);
  private router = inject(Router);

  // Pagination state
  currentPage$ = new BehaviorSubject<number>(1);
  currentPage: number = 1;
  totalPagesCount: number = 0;
  itemsPerPage = 10;

  // Observable for paginated orders
  paginatedOrders$: Observable<PaginatedOrders>;
  ordersDto$: Observable<OrderDto[]>; // Renamed from orders$
  transformedOrders$!: Observable<Order[]>; // Use non-null assertion, initialized in ngOnInit
  totalOrders$: Observable<number>;
  totalPages$: Observable<number>;
  isLoading$: Observable<boolean>;

  private currentOrderDtos: OrderDto[] = []; // To help find order by number for navigation

  constructor(private cdr: ChangeDetectorRef) {
    // Create a loading state observable that starts with true
    const loadingStart$ = this.currentPage$.pipe(
      withLatestFrom(this.storeContextService.currentStoreSlug$),
      map(() => ({ loading: true, data: null }))
    );

    // Create the actual data observable
    const dataObservable$ = this.currentPage$.pipe(
      withLatestFrom(this.storeContextService.currentStoreSlug$),
      switchMap(([page, storeSlug]) => {
        if (!storeSlug) {
          console.error(this.i18nService.translate(this.tKeys.SF_ACCOUNT_ORDERS_SLUG_NOT_AVAILABLE_ERROR));
          return of({ orders: [], total: 0 } as PaginatedOrders);
        }
        return this.apiService.getUserOrders(page, this.itemsPerPage, storeSlug);
      }),
      map(data => ({ loading: false, data }))
    );

    // Combine loading and data states
    const stateObservable$ = loadingStart$.pipe(
      switchMap(() => dataObservable$.pipe(startWith({ loading: true, data: null }))),
      shareReplay(1)
    );

    this.isLoading$ = stateObservable$.pipe(
      map(state => state.loading)
    );

    this.paginatedOrders$ = stateObservable$.pipe(
      map(state => state.data || { orders: [], total: 0 }),
      tap(paginatedResult => this.currentOrderDtos = paginatedResult.orders),
      shareReplay(1)
    );

    this.ordersDto$ = this.paginatedOrders$.pipe(
      map(result => result.orders)
    );
    
    this.totalOrders$ = this.paginatedOrders$.pipe(
      map(result => result.total)
    );
    
    this.totalPages$ = this.totalOrders$.pipe(
      map(total => Math.ceil(total / this.itemsPerPage))
    );

    this.currentPage$.subscribe(page => this.currentPage = page);
    this.totalPages$.subscribe(totalPages => this.totalPagesCount = totalPages);
  }

  ngOnInit(): void {
    this.transformedOrders$ = this.ordersDto$.pipe(
      map(dtos => dtos.map(dto => this.transformOrderDtoToOrder(dto)))
    );
  }

  goToPage(page: number): void {
    this.currentPage$.next(page);
  }

  public get paginationSummaryText(): string {
    return this.i18nService.translate(this.tKeys.SF_ACCOUNT_ORDERS_PAGINATION_SUMMARY, this.currentPage, this.totalPagesCount);
  }

  private transformOrderDtoToOrder(dto: OrderDto): Order {
    const items: OrderItem[] = dto.items.map(itemDto => ({
      id: itemDto.id,
      productId: itemDto.productId,
      productName: itemDto.productName,
      quantity: itemDto.quantity,
      price: itemDto.pricePerUnit,
    }));

    const shippingAddress = dto.shippingAddress ? {
      id: dto.shippingAddress.id,
      fullName: dto.shippingAddress.fullName,
      street1: dto.shippingAddress.street1,
      street2: dto.shippingAddress.street2,
      city: dto.shippingAddress.city,
      postalCode: dto.shippingAddress.postalCode,
      country: dto.shippingAddress.country,
    } : undefined;

    return {
      id: dto.id,
      orderNumber: dto.orderReference,
      orderReference: dto.orderReference,
      createdAt: new Date(dto.orderDate).toISOString(),
      status: dto.status as OrderStatus,
      totalAmount: dto.totalAmount,
      subtotal: dto.subtotal,
      shippingCost: dto.shippingCost,
      taxAmount: dto.taxAmount,
      items: items,
      shippingAddress: shippingAddress,
      shippingMethod: dto.shippingMethod,
      paymentStatus: dto.paymentStatus,
      trackingNumber: dto.trackingNumber,
    };
  }

  onViewOrder(orderNumber: string): void {
    const orderToView = this.currentOrderDtos.find(o => o.orderReference === orderNumber);
    if (orderToView) {
      this.router.navigate(['/account/orders', orderToView.id]);
    } else {
      console.warn(`Order with reference ${orderNumber} not found in current list.`);
    }
  }

  onDownloadInvoice(orderNumber: string): void {
    console.log(`Download invoice requested for order: ${orderNumber}`);
    alert(`Invoice download for ${orderNumber} is not yet implemented.`);
  }
}
