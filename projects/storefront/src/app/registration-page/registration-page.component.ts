import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms'; // Use ReactiveFormsModule
import { Router, RouterModule } from '@angular/router'; // For navigation and routerLink
import { ApiService } from '../core/services/api.service'; // Import ApiService
import { HttpErrorResponse } from '@angular/common/http';
import { T, I18nService, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Import ReactiveFormsModule
    RouterModule, // For login link
    TranslatePipe
  ],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss'
})
export class RegistrationPageComponent implements OnInit {
  public tKeys = T;
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private i18nService = inject(I18nService);

  registrationForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(100),
      // Removed pattern validation
    ]],
    confirmPassword: ['', [Validators.required]],
    // Use regex matching backend for Israeli numbers (05X-XXXXXXX or 0X-XXXXXXX)
    phone: ['', [Validators.pattern(/^0\d{1,2}-?\d{7}$/), Validators.maxLength(20)]],
    newsletterOptIn: [false], // Re-add newsletter opt-in control
    terms: [false, Validators.requiredTrue] // Re-add terms control, required
  }, { validators: this.passwordMatchValidator });

  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  submitted = false; // Flag to track submission attempt

  ngOnInit(): void {}

  // Custom validator function
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else if (confirmPassword?.hasError('passwordMismatch')) {
       // Clear error if they now match or password changes
       confirmPassword.setErrors(null);
    }
    return null;
  }


  onSubmit(): void {
    this.submitted = true; // Set submitted flag on attempt
    this.errorMessage = null;
    this.successMessage = null;
    this.registrationForm.markAllAsTouched(); // Mark all fields as touched to show errors

    if (this.registrationForm.invalid || this.isSubmitting) {
      console.log('Form Invalid:', this.registrationForm.errors);
      // Find specific errors
       Object.keys(this.registrationForm.controls).forEach(key => {
         const controlErrors = this.registrationForm.get(key)?.errors;
         if (controlErrors != null) {
           console.log('Key control: ' + key + ', errors: ' + JSON.stringify(controlErrors));
         }
       });
      return;
    }

    this.isSubmitting = true;

    // Exclude only confirmPassword before sending
    // We now *want* newsletterOptIn and terms included in formData
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...formData } = this.registrationForm.value;

    this.apiService.register(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message ? response.message : this.i18nService.translate(T.SF_REGISTRATION_SUCCESS_MESSAGE_DEFAULT);
        console.log('Registration successful:', response);
        // Optionally clear form or redirect after a delay
        this.registrationForm.reset();
        // setTimeout(() => this.router.navigate(['/login']), 2000); // Redirect to login later
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (error.status === 409) { // Conflict - email likely exists
          this.errorMessage = error.error?.message ? error.error.message : this.i18nService.translate(T.SF_REGISTRATION_ERROR_EMAIL_EXISTS_DEFAULT);
          this.registrationForm.get('email')?.setErrors({ emailExists: true });
        } else {
          this.errorMessage = error.error?.message ? error.error.message : this.i18nService.translate(T.SF_REGISTRATION_ERROR_UNEXPECTED_DEFAULT);
        }
        console.error('Registration failed:', error);
      }
    });
  }

  // Helper getters for template validation
  get firstName() { return this.registrationForm.get('firstName'); }
  get lastName() { return this.registrationForm.get('lastName'); }
  get email() { return this.registrationForm.get('email'); }
  get password() { return this.registrationForm.get('password'); }
  get confirmPassword() { return this.registrationForm.get('confirmPassword'); }
  get phone() { return this.registrationForm.get('phone'); }
  get newsletterOptIn() { return this.registrationForm.get('newsletterOptIn'); } // Re-add getter
  get terms() { return this.registrationForm.get('terms'); } // Re-add getter
}
