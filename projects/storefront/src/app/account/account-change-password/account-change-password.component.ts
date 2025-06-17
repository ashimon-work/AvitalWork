import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService, ChangePasswordDto } from '../../core/services/api.service';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { I18nService } from '@shared/i18n';

@Component({
  selector: 'app-account-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './account-change-password.component.html',
  styleUrls: ['./account-change-password.component.scss'] // Corrected property name
})
export class AccountChangePasswordComponent {
  public tKeys = T;
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private i18nService = inject(I18nService);

  changePasswordForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor() {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        // Add pattern validator if needed, matching registration
        // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for matching new passwords
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');

    // Don't validate if controls aren't dirty yet or if newPassword is empty/invalid itself
    if (!newPassword || !confirmNewPassword || !newPassword.value || !confirmNewPassword.dirty) {
      return null;
    }

    if (newPassword.value !== confirmNewPassword.value) {
      confirmNewPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Clear mismatch error if it exists and passwords now match
      if (confirmNewPassword.hasError('passwordMismatch')) {
         const errors = confirmNewPassword.errors ?? {};
         delete errors['passwordMismatch'];
         confirmNewPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return null;
    }
  }

  saveNewPassword(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.changePasswordForm.invalid) {
      this.errorMessage = this.i18nService.translate(this.tKeys.SF_ACCOUNT_CHANGE_PASSWORD_FORM_INVALID_MESSAGE);
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const passwordData: ChangePasswordDto = {
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword,
    };

    this.apiService.changeUserPassword(passwordData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = this.i18nService.translate(this.tKeys.SF_ACCOUNT_CHANGE_PASSWORD_SUCCESS);
        this.changePasswordForm.reset(); // Clear form
      },
      error: (err) => {
        this.isLoading = false;
        // Handle specific errors like incorrect current password (e.g., 401 or 403 from backend)
        if (err.status === 401 || err.status === 403) {
             this.errorMessage = this.i18nService.translate(this.tKeys.SF_ACCOUNT_CHANGE_PASSWORD_CURRENT_INCORRECT_ERROR);
             this.changePasswordForm.get('currentPassword')?.setErrors({ incorrect: true });
        } else {
            this.errorMessage = err.error?.message || this.i18nService.translate(this.tKeys.SF_ACCOUNT_CHANGE_PASSWORD_FAILED);
        }
        console.error('Error changing password:', err);
      }
    });
  }

  // Helper getters for template validation
  get currentPassword() { return this.changePasswordForm.get('currentPassword'); }
  get newPassword() { return this.changePasswordForm.get('newPassword'); }
  get confirmNewPassword() { return this.changePasswordForm.get('confirmNewPassword'); }
}
