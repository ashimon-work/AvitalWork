import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // May be needed for directives
import { RouterLink } from '@angular/router'; // For routerLink
import { NewsletterFormComponent } from '../../../shared/components/newsletter-form/newsletter-form.component'; // Import Newsletter Form

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NewsletterFormComponent // Add NewsletterFormComponent
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}
