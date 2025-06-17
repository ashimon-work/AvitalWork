import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiService, UpdateUserInfoDto } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { tap, first } from 'rxjs';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-account-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDividerModule],
  templateUrl: './account-personal-info.component.html',
  styleUrls: ['./account-personal-info.component.scss']
})
export class AccountPersonalInfoComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  public tKeys = T;
  personalInfoForm: FormGroup;
  isLoading = false;
  isFetching = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor() {
    this.personalInfoForm = this.fb.group({
      // Email is usually not editable here, display only
      email: [{ value: '', disabled: true }], // Display only
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      phone: ['', [Validators.pattern(/^0\d{1,2}-?\d{7}$/), Validators.maxLength(20)]], // Same pattern as registration
      // Add birthday later if needed
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isFetching = true;
    this.errorMessage = null;
    this.successMessage = null;
    // Use AuthService currentUser$ first for potentially cached data
    this.authService.currentUser$.pipe(first()).subscribe(user => {
      if (user) {
        this.personalInfoForm.patchValue({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone
        });
        this.isFetching = false;
      } else {
        // Fallback to API if auth service doesn't have it (shouldn't happen if logged in)
        this.apiService.getUserProfile().subscribe({
          next: (profile) => {
            if (profile) {
              this.personalInfoForm.patchValue(profile);
            } else {
              this.errorMessage = this.tKeys.SF_ACCOUNT_PERSONAL_INFO_LOAD_ERROR;
            }
            this.isFetching = false;
          },
          error: (err) => {
            this.errorMessage = this.tKeys.SF_ACCOUNT_PERSONAL_INFO_LOAD_ERROR;
            console.error('Error fetching profile:', err);
            this.isFetching = false;
          }
        });
      }
    });
  }

  savePersonalInfo(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.personalInfoForm.invalid) {
      this.errorMessage = this.tKeys.SF_ACCOUNT_PERSONAL_INFO_FORM_INVALID_MESSAGE;
      this.personalInfoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData: UpdateUserInfoDto = {
      firstName: this.personalInfoForm.value.firstName,
      lastName: this.personalInfoForm.value.lastName,
      phone: this.personalInfoForm.value.phone || undefined, // Send undefined if empty
    };

    this.apiService.updateUserPersonalInfo(formData).subscribe({
      next: (updatedUser) => {
        this.isLoading = false;
        this.successMessage = this.tKeys.SF_ACCOUNT_PERSONAL_INFO_UPDATE_SUCCESS;
        // Optionally update AuthService state if necessary
        this.authService.updateCurrentUserState(updatedUser); // Assuming AuthService has such a method
        this.personalInfoForm.markAsPristine(); // Mark form as unchanged
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || this.tKeys.SF_ACCOUNT_PERSONAL_INFO_UPDATE_FAILED;
        console.error('Error updating personal info:', err);
      }
    });
  }

  // Helper getters for template validation
  get firstName() { return this.personalInfoForm.get('firstName'); }
  get lastName() { return this.personalInfoForm.get('lastName'); }
  get phone() { return this.personalInfoForm.get('phone'); }
}
