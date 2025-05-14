import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, OrderDto } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-account-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './account-order-detail.component.html',
  styleUrls: ['./account-order-detail.component.scss']
})
export class AccountOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);

  order$: Observable<OrderDto | null> = of(null);
  isLoading = false;

  ngOnInit(): void {
    this.isLoading = true;
    this.order$ = this.route.paramMap.pipe(
      tap(() => this.isLoading = true),
      switchMap(params => {
        const orderId = params.get('orderId');
        if (orderId) {
          return this.apiService.getUserOrderDetails(orderId).pipe(
            catchError(err => {
              this.notificationService.showError(err.error?.message || 'Failed to load order details.');
              console.error('Error loading order details:', err);
              return of(null);
            })
          );
        }
        this.notificationService.showError('Order ID not found.');
        return of(null);
      }),
      tap(() => this.isLoading = false)
    );
  }
}