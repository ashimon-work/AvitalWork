import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule for async pipe, *ngIf, DatePipe
import { ApiService, AccountOverviewDto } from '../../core/services/api.service'; // Import ApiService and AccountOverviewDto
import { NotificationService } from '../../core/services/notification.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink

@Component({
  selector: 'app-account-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe], // Add CommonModule, RouterModule, DatePipe
  templateUrl: './account-overview.component.html',
  styleUrls: ['./account-overview.component.scss'] // Corrected property name
})
export class AccountOverviewComponent implements OnInit {
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);

  accountOverview$: Observable<AccountOverviewDto | null> = of(null);
  isLoading = false;

  // Example: Calculate profile completeness (simplified)
  profileCompleteness = 0;

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
        this.notificationService.showError(err.error?.message || 'Failed to load account overview.');
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
      return 'No default shipping address set.';
    }
    const defaultShipping = overview.addresses.find(addr => addr.isDefaultShipping);
    return defaultShipping
      ? `${defaultShipping.street1}, ${defaultShipping.city}, ${defaultShipping.postalCode}`
      : 'No default shipping address set.';
  }
}
