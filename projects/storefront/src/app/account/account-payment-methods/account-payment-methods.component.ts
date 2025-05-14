
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, PaymentMethodDto, CreatePaymentMethodPayload, UpdatePaymentMethodPayload, AddressDto } from '../../core/services/api.service';
import { Observable, BehaviorSubject, switchMap, tap, catchError, of, forkJoin } from 'rxjs';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-account-payment-methods',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './account-payment-methods.component.html',
  styleUrls: ['./account-payment-methods.component.scss']
})
export class AccountPaymentMethodsComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  private refreshPaymentMethods$ = new BehaviorSubject<void>(undefined);
  paymentMethods$: Observable<PaymentMethodDto[]>;
  userAddresses$: Observable<AddressDto[]>;

  paymentMethodForm: FormGroup;
  isEditing = false;
  editingMethodId: string | null = null;
  showForm = false;

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;


  constructor() {
    this.paymentMethodForm = this.fb.group({
      // For a real app, use Stripe Elements or similar for PCI compliance.
      // This form is a simplified representation.
      paymentGatewayToken: ['tok_visa', Validators.required], // Placeholder for a token from a payment gateway
      type: ['card', Validators.required], // Default to 'card'
      billingAddressId: ['', Validators.required],
      isDefault: [false]
    });

    this.paymentMethods$ = this.refreshPaymentMethods$.pipe(
      tap(() => {
        this.isLoading = true;
        this.clearMessages();
      }),
      switchMap(() => this.apiService.getUserPaymentMethods().pipe(
        catchError(err => {
          this.notificationService.showError(err.error?.message || 'Failed to load payment methods.');
          return of([]); // Return empty array on error
        })
      )),
      tap(() => this.isLoading = false)
    );

    this.userAddresses$ = this.apiService.getUserAddresses().pipe(
      catchError(err => {
        this.notificationService.showError(err.error?.message || 'Failed to load addresses for payment form.');
        return of([]);
      })
    );
  }

  ngOnInit(): void {
    // Initial fetch handled by observable setup
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      paymentMethods: this.apiService.getUserPaymentMethods(),
      addresses: this.apiService.getUserAddresses()
    }).pipe(
      tap(() => this.isLoading = false),
      catchError(err => {
        this.isLoading = false;
        this.notificationService.showError(err.error?.message || 'Failed to load initial account data.');
        return of({ paymentMethods: [], addresses: [] });
      })
    ).subscribe(data => {
      // Data is available via the paymentMethods$ and userAddresses$ observables
      // Trigger refresh if needed, or directly assign if not using async pipe for initial load
      this.refreshPaymentMethods$.next(); // Refresh the payment methods list
    });
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
          this.notificationService.showSuccess('Payment method removed successfully.');
          this.refreshList();
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.showError(err.error?.message || 'Failed to remove payment method.');
          console.error('Error deleting payment method:', err);
        }
      });
    }
  }

  toggleForm(method?: PaymentMethodDto): void {
    this.showForm = !this.showForm;
    this.isEditing = !!method;
    this.editingMethodId = method ? method.id : null;

    if (this.showForm) {
      if (this.isEditing && method) {
        // Pre-fill form for editing
        // Note: paymentGatewayToken and type are usually not editable for existing methods.
        // This example assumes we might allow changing billingAddressId or isDefault.
        this.paymentMethodForm.patchValue({
          billingAddressId: method.billingAddress?.id || '', // Assuming billingAddress is part of PaymentMethodDto
          isDefault: method.isDefault,
          // type: method.cardType, // Or a generic 'type' if available
          // paymentGatewayToken: method.id // This is not the gateway token, but the entity ID.
                                        // For editing, you usually don't change the token.
        });
      } else {
        // Reset for adding new
        this.paymentMethodForm.reset({
          paymentGatewayToken: 'tok_visa', // Reset to placeholder or clear
          type: 'card',
          billingAddressId: '',
          isDefault: false
        });
      }
    }
  }

  onSubmit(): void {
    if (this.paymentMethodForm.invalid) {
      this.notificationService.showError('Please fill in all required fields.');
      Object.values(this.paymentMethodForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const formValues = this.paymentMethodForm.value;

    if (this.isEditing && this.editingMethodId) {
      const payload: UpdatePaymentMethodPayload = {
        billingAddressId: formValues.billingAddressId,
        isDefault: formValues.isDefault
      };
      this.apiService.updateUserPaymentMethod(this.editingMethodId, payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.showSuccess('Payment method updated successfully.');
          this.refreshList();
          this.toggleForm(); // Close form
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.showError(err.error?.message || 'Failed to update payment method.');
        }
      });
    } else {
      const payload: CreatePaymentMethodPayload = {
        type: formValues.type,
        paymentGatewayToken: formValues.paymentGatewayToken, // This should be obtained from a payment gateway SDK
        billingAddressId: formValues.billingAddressId,
        isDefault: formValues.isDefault
      };
      this.apiService.addUserPaymentMethod(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.showSuccess('Payment method added successfully.');
          this.refreshList();
          this.toggleForm(); // Close form
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.showError(err.error?.message || 'Failed to add payment method.');
        }
      });
    }
  }

  // Add methods for edit/set default later if backend supports it
}
