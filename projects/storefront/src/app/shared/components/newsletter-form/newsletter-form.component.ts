import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { ApiService } from '../../../core/services/api.service'; // Adjust path if needed

@Component({
  selector: 'app-newsletter-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule // Add FormsModule
  ],
  templateUrl: './newsletter-form.component.html',
  styleUrl: './newsletter-form.component.scss'
})
export class NewsletterFormComponent {
  email: string = '';
  message: string = ''; // For success/error feedback
  isSubmitting: boolean = false;
  isSuccess: boolean = false;

  constructor(private apiService: ApiService) {}

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.email) {
      this.message = 'Please enter a valid email address.';
      this.isSuccess = false;
      return;
    }

    this.isSubmitting = true;
    this.message = ''; // Clear previous messages

    this.apiService.subscribeNewsletter(this.email).subscribe({
      next: (response) => {
        console.log('Subscription successful:', response);
        this.message = 'Thank you for subscribing!';
        this.isSuccess = true;
        this.email = ''; // Clear input on success
        form.resetForm(); // Reset form state
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Subscription error:', error);
        // Provide a user-friendly error message
        this.message = error.error?.message || 'Subscription failed. Please try again later.';
        this.isSuccess = false;
        this.isSubmitting = false;
      }
    });
  }
}

