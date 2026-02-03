import { Component, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { T, TranslatePipe, I18nService } from '@shared/i18n';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { take } from 'rxjs/operators';

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

interface StoreDetails {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  // Optional: Add coordinates if needed for a map library
  // latitude?: number;
  // longitude?: number;
}

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss'],
  // animations: [] // Placeholder for Angular Animations
})
export class ContactPageComponent implements OnInit {
  public tKeys = T;
  contactForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;
  
  storeDetails: StoreDetails = {
    street: "123 Commerce Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    phone: "+1 (555) 123-4567",
    email: "contact@luxestore.com"
  };

  faqList: FaqItem[] = [];

  // A flag to decide whether to use a dedicated component or inline template for the form.
  // For now, we'll plan for an integrated form as per the HTML plan.
  useDedicatedContactFormComponent = false;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private apiService: ApiService,
    private storeContextService: StoreContextService,
    private i18nService: I18nService
  ) {
    // Listen for language changes and update FAQ content
    effect(() => {
      // Access the signal to trigger the effect when language changes
      this.i18nService.currentLang$();
      this.initializeFaqList();
    });
  }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required], // Made required as per backend DTO
      message: ['', Validators.required]
    });

    // Initialize FAQ list with translated content
    this.initializeFaqList();

    // Debug: Log current store slug
    this.storeContextService.currentStoreSlug$.subscribe(slug => {
      console.log('[ContactPageComponent] Current store slug:', slug);
    });
  }

  private initializeFaqList(): void {
    this.faqList = [
      {
        question: this.i18nService.translate('SF_CONTACT_FAQ_OPENING_HOURS_QUESTION'),
        answer: this.i18nService.translate('SF_CONTACT_FAQ_OPENING_HOURS_ANSWER'),
        isOpen: false
      },
      {
        question: this.i18nService.translate('SF_CONTACT_FAQ_TRACK_ORDER_QUESTION'),
        answer: this.i18nService.translate('SF_CONTACT_FAQ_TRACK_ORDER_ANSWER'),
        isOpen: false
      },
      {
        question: this.i18nService.translate('SF_CONTACT_FAQ_RETURN_POLICY_QUESTION'),
        answer: this.i18nService.translate('SF_CONTACT_FAQ_RETURN_POLICY_ANSWER'),
        isOpen: false
      }
    ];
  }

  onContactSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitError = null;
      this.submitSuccess = false;

      const formData = this.contactForm.value;
      
      // Get current store slug
      this.storeContextService.currentStoreSlug$.pipe(take(1)).subscribe(storeSlug => {
        console.log('Submitting contact form with store slug:', storeSlug);
        console.log('Form data:', formData);
        
        if (!storeSlug) {
          console.error('Store slug is missing, cannot submit contact form');
          this.isSubmitting = false;
          this.submitError = this.i18nService.translate('SF_CONTACT_FORM_SUBMISSION_ERROR_STORE_MISSING');
          
          // Hide error message after 5 seconds
          setTimeout(() => {
            this.submitError = null;
          }, 5000);
          return;
        }
        
        this.apiService.submitContactForm(storeSlug, formData).subscribe({
          next: (response) => {
            console.log('Contact form submitted successfully:', response);
            this.isSubmitting = false;
            this.submitSuccess = true;
            this.contactForm.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
              this.submitSuccess = false;
            }, 5000);
          },
          error: (error) => {
            console.error('Error submitting contact form:', error);
            this.isSubmitting = false;
            
            // Extract more specific error message from the backend response
            let errorMessage = this.i18nService.translate('SF_CONTACT_FORM_SUBMISSION_ERROR_GENERAL');
            
            if (error.error) {
              if (error.error.message) {
                errorMessage = error.error.message;
              } else if (typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error.error) {
                errorMessage = error.error.error;
              }
            }
            
            this.submitError = errorMessage;
            
            // Hide error message after 10 seconds for longer error messages
            setTimeout(() => {
              this.submitError = null;
            }, 10000);
          }
        });
      });
    } else {
      // Mark all fields as touched to display validation errors
      this.contactForm.markAllAsTouched();
    }
  }

  toggleFaq(faqItem: FaqItem): void {
    faqItem.isOpen = !faqItem.isOpen;
  }

  getMapUrl(): SafeResourceUrl {
    // Use Google Maps embed without API key for basic functionality
    const address = encodeURIComponent(
      `${this.storeDetails.street}, ${this.storeDetails.city}, ${this.storeDetails.state} ${this.storeDetails.zipCode}, ${this.storeDetails.country}`
    );
    const mapUrl = `https://maps.google.com/maps?q=${address}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  getGoogleMapsSearchQuery(): string {
    return encodeURIComponent(
      `${this.storeDetails.street}, ${this.storeDetails.city}, ${this.storeDetails.state} ${this.storeDetails.zipCode}, ${this.storeDetails.country}`
    );
  }
}
