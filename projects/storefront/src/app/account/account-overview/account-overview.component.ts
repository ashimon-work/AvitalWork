import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common'; // Import CommonModule for async pipe, *ngIf, DatePipe
import { ApiService, AccountOverviewDto } from '../../core/services/api.service'; // Import ApiService and AccountOverviewDto
import { NotificationService } from '../../core/services/notification.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { I18nService } from '@shared/i18n';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-account-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, CurrencyPipe, TranslatePipe, MatCardModule, MatButtonModule, MatProgressBarModule, MatTableModule, MatDividerModule], // Add CommonModule, RouterModule, DatePipe, TranslatePipe
  templateUrl: './account-overview.component.html',
  styleUrls: ['./account-overview.component.scss'] // Corrected property name
})
export class AccountOverviewComponent implements OnInit {
  public tKeys = T;
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private i18nService = inject(I18nService);

  accountOverview$: Observable<AccountOverviewDto | null> = of(null);
  isLoading = false;

  // Example: Calculate profile completeness (simplified)
  profileCompleteness = 0;

  // Table columns for orders table
  displayedColumns: string[] = ['orderNumber', 'date', 'status', 'total', 'action'];

  ngOnInit(): void {
    this.isLoading = true;
    this.accountOverview$ = this.apiService.getAccountOverview().pipe(
      tap(overview => {
        this.isLoading = false;
        if (overview && overview.profile) {
          this.calculateProfileCompleteness(overview.profile);
        }
      }),
      catchError(err => {
        this.isLoading = false;
        this.notificationService.showError(err.error?.message || this.i18nService.translate(this.tKeys.SF_ACCOUNT_OVERVIEW_LOAD_FAILED_NOTIFICATION));
        console.error('Error loading account overview:', err);
        return of(null);
      })
    );
  }

  calculateProfileCompleteness(profile: AccountOverviewDto['profile']): void {
    let completedFields = 0;
    const totalFields = 3; // Example: firstName, lastName, phone

    if (profile.firstName) completedFields++;
    if (profile.lastName) completedFields++;
    if (profile.phone) completedFields++;
    // Add more checks for other relevant profile fields

    this.profileCompleteness = Math.round((completedFields / totalFields) * 100);
  }

  // Helper to get default shipping address (example)
  getDefaultShippingAddress(overview: AccountOverviewDto | null): string {
    if (!overview || !overview.addresses || overview.addresses.length === 0) {
      return this.i18nService.translate(this.tKeys.SF_ACCOUNT_OVERVIEW_NO_DEFAULT_SHIPPING_ADDRESS);
    }
    const defaultShipping = overview.addresses.find(addr => addr.isDefaultShipping);
    return defaultShipping
      ? `${defaultShipping.street1}, ${defaultShipping.city}, ${defaultShipping.postalCode}`
      : this.i18nService.translate(this.tKeys.SF_ACCOUNT_OVERVIEW_NO_DEFAULT_SHIPPING_ADDRESS);
  }

  // Get status CSS class for badges
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'shipped':
        return 'status-success';
      case 'processing':
      case 'pending':
        return 'status-warning';
      case 'cancelled':
      case 'refunded':
        return 'status-danger';
      default:
        return 'status-secondary';
    }
  }
}
