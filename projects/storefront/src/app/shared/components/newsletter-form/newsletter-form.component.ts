import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { ApiService, SubscribeNewsletterPayload } from '../../../core/services/api.service'; // Adjust path if needed
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { I18nService } from '@shared/i18n';
import { inject } from '@angular/core';

@Component({
  selector: 'app-newsletter-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Add FormsModule
    TranslatePipe
  ],
  templateUrl: './newsletter-form.component.html',
  styleUrl: './newsletter-form.component.scss'
})
export class NewsletterFormComponent {
  public tKeys = T;
  email: string = '';
  message: string = ''; // For success/error feedback
  isSubmitting: boolean = false;
  isSuccess: boolean = false;

  private i18nService = inject(I18nService);

  constructor(private apiService: ApiService) {}

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.email) {
      this.message = this.i18nService.translate(this.tKeys.SF_NEWSLETTER_VALID_EMAIL_REQUIRED);
      this.isSuccess = false;
      return;
    }

    this.isSubmitting = true;
    this.message = ''; // Clear previous messages

    const payload: SubscribeNewsletterPayload = {
      email: this.email,
      source: 'footer-signup' // Or make this dynamic if needed
    };

    this.apiService.subscribeNewsletter(payload).subscribe({
      next: (response) => {
        console.log('Subscription successful:', response);
        this.message = this.i18nService.translate(this.tKeys.SF_NEWSLETTER_SUBSCRIPTION_SUCCESS);
        this.isSuccess = true;
        this.email = ''; // Clear input on success
        form.resetForm(); // Reset form state
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Subscription error:', error);
        // Provide a user-friendly error message
        this.message = error.error?.message || this.i18nService.translate(this.tKeys.SF_NEWSLETTER_SUBSCRIPTION_FAILED);
        this.isSuccess = false;
        this.isSubmitting = false;
      }
    });
  }
}

