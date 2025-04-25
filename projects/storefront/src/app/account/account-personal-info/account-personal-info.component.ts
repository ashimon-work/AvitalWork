import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiService, UpdateUserInfoDto } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service'; // To get initial data potentially
import { tap, first } from 'rxjs';

@Component({
  selector: 'app-account-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-personal-info.component.html',
  styleUrls: ['./account-personal-info.component.scss'] // Corrected property name
})
export class AccountPersonalInfoComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService); // Inject AuthService
  private fb = inject(FormBuilder);

  personalInfoForm: FormGroup;
  isLoading = false;
  isFetching = false; // Separate flag for initial load
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
              this.errorMessage = 'Could not load profile data.';
            }
            this.isFetching = false;
          },
          error: (err) => {
            this.errorMessage = 'Error loading profile data.';
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
      this.errorMessage = 'Please fill in all required fields correctly.';
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
        this.successMessage = 'Personal information updated successfully.';
        // Optionally update AuthService state if necessary
        this.authService.updateCurrentUserState(updatedUser); // Assuming AuthService has such a method
        this.personalInfoForm.markAsPristine(); // Mark form as unchanged
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to update personal information.';
        console.error('Error updating personal info:', err);
      }
    });
  }

  // Helper getters for template validation
  get firstName() { return this.personalInfoForm.get('firstName'); }
  get lastName() { return this.personalInfoForm.get('lastName'); }
  get phone() { return this.personalInfoForm.get('phone'); }
}
