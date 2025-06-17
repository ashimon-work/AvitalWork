import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslatePipe],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  public tKeys = T;
  email!: string;
  password!: string;
  passwordVisible: boolean = false;
  loginError: string | null = null;

  isForgotPasswordModalVisible: boolean = false;
  resetEmail!: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  login(): void {
    console.log('Login attempt with:', this.email, this.password);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        // Store the JWT (assuming the response contains an access_token property)
        if (response && response.access_token) {
          localStorage.setItem('manager_auth_token', response.access_token);
          console.log('JWT stored in local storage.');

          // Get the store slug from the current route
          const storeSlug = this.route.snapshot.paramMap.get('storeSlug');

          if (storeSlug) {
            console.log(`Login successful. Redirecting to /${storeSlug}/dashboard`);
            this.router.navigate(['/', storeSlug, 'dashboard']);
          } else {
            console.error('Login successful, but store slug not found in route.');
            this.loginError = 'Login successful, but could not determine store dashboard to redirect.';
          }
        } else {
           console.error('Login successful but no access_token received.');
           this.loginError = 'Login successful, but no access token received.';
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        // Handle login error (e.g., display error message)
        if (error.status === 401) {
          this.loginError = 'Invalid email or password.';
        } else {
          this.loginError = 'An error occurred during login. Please try again.';
        }
      }
    });
  }

  openForgotPasswordModal(): void {
    this.isForgotPasswordModalVisible = true;
    this.resetEmail = ''; // Clear previous email
  }

  closeForgotPasswordModal(): void {
    this.isForgotPasswordModalVisible = false;
  }

 submitForgotPassword(): void {
   console.log('Submitting forgot password request for email:', this.resetEmail);
   // Basic email validation
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(this.resetEmail)) {
     this.notificationService.showError('Please enter a valid email address.', 'Invalid Email');
     return;
   }

   this.authService.forgotPassword(this.resetEmail).subscribe({
     next: (response) => {
       console.log('Forgot password request successful:', response);
       this.notificationService.showSuccess('Password reset link sent to your email.', 'Request Sent');
       this.closeForgotPasswordModal(); // Close modal on success
    },
    error: (error) => {
      console.error('Forgot password request failed:', error);
      this.notificationService.showError('Failed to send password reset link. Please try again.', 'Request Failed');
    }
  });
 }
}