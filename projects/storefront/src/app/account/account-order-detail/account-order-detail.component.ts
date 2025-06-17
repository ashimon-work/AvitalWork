import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, OrderDto } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { I18nService } from '@shared/i18n';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-account-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, TranslatePipe],
  templateUrl: './account-order-detail.component.html',
  styleUrls: ['./account-order-detail.component.scss']
})
export class AccountOrderDetailComponent implements OnInit {
  public tKeys = T;
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private i18nService = inject(I18nService);

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
              this.notificationService.showError(err.error?.message || this.i18nService.translate(this.tKeys.SF_ACCOUNT_ORDER_DETAIL_LOAD_FAILED_NOTIFICATION));
              console.error('Error loading order details:', err);
              return of(null);
            })
          );
        }
        this.notificationService.showError(this.i18nService.translate(this.tKeys.SF_ACCOUNT_ORDER_DETAIL_ID_NOT_FOUND_NOTIFICATION));
        return of(null);
      }),
      tap(() => this.isLoading = false)
    );
  }
}