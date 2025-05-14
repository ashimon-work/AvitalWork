import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService, FaqItem } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { AsyncPipe, NgIf, NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, NgIf, NgFor, NgClass],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss'
})
export class ContactPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private storeContextService = inject(StoreContextService);

  contactForm!: FormGroup;
  faqs$!: Observable<FaqItem[]>;
  storeContactInfo = {
    email: 'contact@example.com', // Placeholder
    phone: '+1 (555) 123-4567', // Placeholder
    address: '123 Main St, Anytown, USA' // Placeholder
  };
  submissionStatus: { success?: boolean; message?: string } | null = null;

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });

    this.faqs$ = this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          console.warn('Contact Page: Store slug not available for fetching FAQs.');
          return of([]); // Or handle as an error
        }
        return this.apiService.getFaqs(storeSlug);
      }),
      catchError(error => {
        console.error('Error fetching FAQs:', error);
        return of([]); // Return empty array on error
      })
    );

    // Initialize storeContactInfo if it were dynamic, e.g.,
    // this.storeContextService.currentStore$.subscribe(store => {
    //   if (store && store.contactInfo) { // Assuming contactInfo is part of your Store model
    //     this.storeContactInfo = store.contactInfo;
    //   }
    // });
  }

  onSubmitContactForm(): void {
    this.submissionStatus = null;
    if (this.contactForm.valid) {
      this.storeContextService.currentStoreSlug$.pipe(
        switchMap(storeSlug => {
          if (!storeSlug) {
            console.error('Contact form submission: Store slug not available.');
            // Potentially set an error message for the user
            this.submissionStatus = { success: false, message: 'Could not submit form. Store information is missing.' };
            return of(null); // Prevent further processing
          }
          return this.apiService.submitContactForm(storeSlug, this.contactForm.value).pipe(
            tap(() => {
              this.submissionStatus = { success: true, message: 'Your message has been sent successfully!' };
              this.contactForm.reset();
              // Optionally, mark form as pristine and untouched
              Object.keys(this.contactForm.controls).forEach(key => {
                this.contactForm.get(key)?.markAsPristine();
                this.contactForm.get(key)?.markAsUntouched();
                this.contactForm.get(key)?.updateValueAndValidity();
              });
            }),
            catchError(error => {
              console.error('Error submitting contact form:', error);
              this.submissionStatus = { success: false, message: 'There was an error sending your message. Please try again later.' };
              return of(null); // Handle error, prevent breaking the stream
            })
          );
        })
      ).subscribe();
    } else {
      this.contactForm.markAllAsTouched();
      this.submissionStatus = { success: false, message: 'Please fill out all required fields correctly.' };
    }
  }
}
