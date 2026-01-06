import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core'; // Import inject, OnInit, Output, EventEmitter
import { CommonModule } from '@angular/common'; // May be needed for directives
import { StoreContextService } from '../../services/store-context.service'; // Import StoreContextService
import { ApiService } from '../../services/api.service'; // Import ApiService for newsletter subscription
import { Observable } from 'rxjs'; // Import Observable
import { RouterLink } from '@angular/router'; // For routerLink
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // Import ReactiveFormsModule and form classes
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
// MatIconModule, MatIconRegistry, and DomSanitizer might still be needed if other icons use them.
// For now, assuming only social icons were the target, we can comment/remove parts related to them.
// If MatIconModule is used by other parts of the template, it should remain.
// import { MatIconModule } from '@angular/material/icon';
// import { MatIconRegistry } from '@angular/material/icon';
// import { DomSanitizer } from '@angular/platform-browser';

import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

interface NavLink {
  pathSegments: string[];
  isStoreSpecific: boolean;
  translationKey: keyof typeof T;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
    // MatIconModule, // Remove if no other mat-icons are used in the template
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  public tKeys = T;
  currentYear: number = new Date().getFullYear();
  private storeContext = inject(StoreContextService); // Inject StoreContextService
  private apiService = inject(ApiService); // Inject ApiService for newsletter subscription
  currentStoreSlug$: Observable<string | null> = this.storeContext.currentStoreSlug$; // Expose slug observable

  newsletterForm!: FormGroup;
  @Output() onNewsletterSubmit = new EventEmitter<string>();
  newsletterLoading: boolean = false;

  // Success and error message properties
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com', matIconName: 'facebook', type: 'svg' },
    { label: 'Twitter', href: 'https://twitter.com', matIconName: 'twitter', type: 'svg' },
    { label: 'Instagram', href: 'https://instagram.com', matIconName: 'instagram', type: 'svg' },
    { label: 'YouTube', href: 'https://youtube.com', matIconName: 'youtube', type: 'svg' }
  ];

  public NAV_LINKS: NavLink[] = [
    { pathSegments: ['about'], isStoreSpecific: true, translationKey: 'SF_FOOTER_ABOUT_US' },
    { pathSegments: ['contact'], isStoreSpecific: true, translationKey: 'SF_FOOTER_CONTACT_US' },
    { pathSegments: ['faq'], isStoreSpecific: true, translationKey: 'SF_FOOTER_FAQ' },
    { pathSegments: ['shipping'], isStoreSpecific: true, translationKey: 'SF_FOOTER_SHIPPING_POLICY' },
    { pathSegments: ['returns'], isStoreSpecific: true, translationKey: 'SF_FOOTER_RETURN_POLICY' },
  ];

  constructor(
    // private iconRegistry: MatIconRegistry, // No longer needed for social icons if using <img>
    // private sanitizer: DomSanitizer      // No longer needed for social icons if using <img>
  ) {
    // SVG registration is no longer needed here for social icons
  }

  ngOnInit(): void {
    this.newsletterForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  generateRouterLink(link: NavLink, slug: string | null | undefined): string[] {
    if (link.isStoreSpecific) {
      if (slug) {
        return ['/', slug, ...link.pathSegments].filter(segment => segment !== undefined && segment !== null && segment !== '');
      } else {
        return ['/', ...link.pathSegments].filter(segment => segment !== undefined && segment !== null && segment !== '');
      }
    }
    return ['/', ...link.pathSegments].filter(segment => segment !== undefined && segment !== null && segment !== '');
  }

  handleSubmit(): void {
    if (this.newsletterForm.valid) {
      this.newsletterLoading = true;
      this.showSuccessMessage = false;
      this.showErrorMessage = false;

      const email = this.newsletterForm.value.email;

      // Call the actual newsletter API
      this.apiService.subscribeNewsletter({ email, source: 'footer' }).subscribe({
        next: () => {
          this.showSuccessMessage = true;
          this.successMessage = 'Thank you for subscribing!';
          this.newsletterForm.reset();
          this.newsletterLoading = false;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Newsletter subscription error:', error);
          this.showErrorMessage = true;
          // Extract error message from backend response
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Subscription failed. Please try again.';
          }
          this.newsletterLoading = false;
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 5000);
        }
      });
    }
  }
}
