import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, PaymentMethodDto } from '../../core/services/api.service';
import { Observable, BehaviorSubject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-account-payment-methods',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-payment-methods.component.html',
  styleUrls: ['./account-payment-methods.component.scss'] // Corrected property name
})
export class AccountPaymentMethodsComponent implements OnInit {
  private apiService = inject(ApiService);

  private refreshPaymentMethods$ = new BehaviorSubject<void>(undefined);
  paymentMethods$: Observable<PaymentMethodDto[]>;

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor() {
    this.paymentMethods$ = this.refreshPaymentMethods$.pipe(
      tap(() => {
        this.isLoading = true;
        this.clearMessages();
      }),
      switchMap(() => this.apiService.getUserPaymentMethods()),
      tap(() => this.isLoading = false)
    );
  }

  ngOnInit(): void {
    // Initial fetch handled by observable setup
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  private refreshList(): void {
    this.refreshPaymentMethods$.next();
  }

  deletePaymentMethod(methodId: string | undefined): void {
    if (!methodId) return;
    this.clearMessages();
    // Add confirmation dialog for security
    if (confirm('Are you sure you want to remove this payment method? This action cannot be undone.')) {
      this.isLoading = true;
      this.apiService.deleteUserPaymentMethod(methodId).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Payment method removed successfully.';
          this.refreshList();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Failed to remove payment method.';
          console.error('Error deleting payment method:', err);
        }
      });
    }
  }

  // Add methods for edit/set default later if backend supports it
}
