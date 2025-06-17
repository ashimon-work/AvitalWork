import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, AddressDto } from '../../core/services/api.service';
import { Observable, BehaviorSubject, switchMap, tap } from 'rxjs';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { I18nService } from '@shared/i18n';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-account-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDividerModule, MatChipsModule],
  templateUrl: './account-addresses.component.html',
  styleUrls: ['./account-addresses.component.scss']
})
export class AccountAddressesComponent implements OnInit {
  public tKeys = T;
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private i18nService = inject(I18nService);

  private refreshAddresses$ = new BehaviorSubject<void>(undefined);
  addresses$: Observable<AddressDto[]>;

  showForm = false;
  isEditing = false;
  selectedAddressId: string | null = null;
  addressForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    // Initialize the form
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      street1: ['', [Validators.required, Validators.maxLength(255)]],
      street2: ['', [Validators.maxLength(255)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      postalCode: ['', [Validators.required, Validators.maxLength(20)]],
      country: [{ value: 'Israel', disabled: true }, [Validators.required, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.maxLength(20)]],
      // Default flags are handled by separate actions, not usually part of add/edit form directly
      // isDefaultShipping: [false],
      // isDefaultBilling: [false]
    });

    // Initialize the addresses observable
    this.addresses$ = this.refreshAddresses$.pipe(
      tap(() => {
        this.isLoading = true;
        this.cdr.detectChanges();
      }),
      switchMap(() => this.apiService.getUserAddresses()),
      tap(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnInit(): void {
    // Initial fetch is handled by the observable setup
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  private refreshList(): void {
    this.refreshAddresses$.next();
  }

  openAddForm(): void {
    this.clearMessages();
    this.isEditing = false;
    this.selectedAddressId = null;
    this.addressForm.reset();
    this.addressForm.get('country')?.setValue('Israel');
    this.showForm = true;
  }

  openEditForm(address: AddressDto): void {
    this.clearMessages();
    this.isEditing = true;
    this.selectedAddressId = address.id ?? null; // Store the ID
    this.addressForm.patchValue(address); // Populate form with existing data
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedAddressId = null;
    this.addressForm.reset();
    this.clearMessages();
  }

  saveAddress(): void {
    this.clearMessages();
    if (this.addressForm.invalid) {
      this.errorMessage = this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_FORM_INVALID_MESSAGE);
      this.addressForm.markAllAsTouched(); // Show validation errors
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    const addressData = this.addressForm.getRawValue(); // Use getRawValue() to include disabled controls

    let saveObservable: Observable<AddressDto>;

    if (this.isEditing && this.selectedAddressId) {
      // Update existing address
      saveObservable = this.apiService.updateUserAddress(this.selectedAddressId, addressData);
    } else {
      // Add new address
      saveObservable = this.apiService.addUserAddress(addressData);
    }

    saveObservable.subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.successMessage = this.isEditing
          ? this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_SAVE_SUCCESS_UPDATED)
          : this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_SAVE_SUCCESS_ADDED);
        this.closeForm();
        this.refreshList();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = err.error?.message || (this.isEditing
          ? this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_SAVE_FAILED_UPDATE)
          : this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_SAVE_FAILED_ADD));
        console.error('Error saving address:', err);
      }
    });
  }

  deleteAddress(addressId: string | undefined): void {
    if (!addressId) return;
    this.clearMessages();
    if (confirm(this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_DELETE_CONFIRM))) {
      this.isLoading = true;
      this.cdr.detectChanges();
      this.apiService.deleteUserAddress(addressId).subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.successMessage = this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_DELETE_SUCCESS);
          this.refreshList();
        },
        error: (err) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.errorMessage = err.error?.message || this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_DELETE_FAILED);
          console.error('Error deleting address:', err);
        }
      });
    }
  }

  setDefault(addressId: string | undefined, type: 'shipping' | 'billing'): void {
    if (!addressId) return;
    this.clearMessages();
    this.isLoading = true;
    this.cdr.detectChanges();
    this.apiService.setDefaultUserAddress(addressId, type).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.successMessage = type === 'shipping'
          ? this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_DEFAULT_SUCCESS_SHIPPING)
          : this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_DEFAULT_SUCCESS_BILLING);
        this.refreshList(); // Refresh to show updated default status
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorMessage = err.error?.message || (type === 'shipping'
          ? this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_DEFAULT_FAILED_SHIPPING)
          : this.i18nService.translate(this.tKeys.SF_ACCOUNT_ADDRESSES_DEFAULT_FAILED_BILLING));
        console.error(`Error setting default ${type} address:`, err);
      }
    });
  }

  toggleDefault(addressId: string | undefined): void {
    if (!addressId) return;
    
    // For now, we'll focus on shipping default since that's most common
    // In the future, this could be enhanced to handle both shipping and billing
    this.setDefault(addressId, 'shipping');
  }

  // Helper getters for template validation
  get fullName() { return this.addressForm.get('fullName'); }
  get street1() { return this.addressForm.get('street1'); } // Renamed from street
  get street2() { return this.addressForm.get('street2'); } // Renamed from apartmentOrSuite
  get city() { return this.addressForm.get('city'); }
  // get state() { return this.addressForm.get('state'); } // Removed state getter
  get postalCode() { return this.addressForm.get('postalCode'); }
  get country() { return this.addressForm.get('country'); }
  // Add others if needed
}
