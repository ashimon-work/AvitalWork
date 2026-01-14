import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core'; // Import inject, OnInit, Output, EventEmitter
import { CommonModule } from '@angular/common'; // May be needed for directives
import { StoreContextService } from '../../services/store-context.service'; // Import StoreContextService
import { Observable } from 'rxjs'; // Import Observable
import { RouterLink } from '@angular/router'; // For routerLink
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // Import ReactiveFormsModule and form classes
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// MatIconModule, MatIconRegistry, and DomSanitizer might still be needed if other icons use them.
// For now, assuming only social icons were the target, we can comment/remove parts related to them.
// If MatIconModule is used by other parts of the template, it should remain.
// import { MatIconModule } from '@angular/material/icon';
// import { MatIconRegistry } from '@angular/material/icon';
// import { DomSanitizer } from '@angular/platform-browser';

import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

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
    MatButtonModule,
    MatIconModule // Add MatIconModule for the send icon
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  public tKeys = T;
  currentYear: number = new Date().getFullYear();
  private storeContext = inject(StoreContextService); // Inject StoreContextService
  currentStoreSlug$: Observable<string | null> = this.storeContext.currentStoreSlug$; // Expose slug observable

  newsletterForm!: FormGroup;
  @Output() onNewsletterSubmit = new EventEmitter<string>();
  newsletterLoading: boolean = false;

  socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com', matIconName: 'facebook', type: 'svg' },
    { label: 'Twitter', href: 'https://twitter.com', matIconName: 'twitter', type: 'svg' },
    { label: 'Instagram', href: 'https://instagram.com', matIconName: 'instagram', type: 'svg' },
    { label: 'YouTube', href: 'https://youtube.com', matIconName: 'youtube', type: 'svg' }
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

  handleSubmit(): void {
    if (this.newsletterForm.valid) {
      this.newsletterLoading = true;
      this.onNewsletterSubmit.emit(this.newsletterForm.value.email);
      // Simulate API call
      setTimeout(() => {
        this.newsletterForm.reset();
        this.newsletterLoading = false;
      }, 1000);
    }
  }
}
