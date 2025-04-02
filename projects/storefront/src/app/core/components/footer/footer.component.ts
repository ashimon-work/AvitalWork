import { Component, inject } from '@angular/core'; // Import inject
import { CommonModule } from '@angular/common'; // May be needed for directives
import { StoreContextService } from '../../services/store-context.service'; // Import StoreContextService
import { Observable } from 'rxjs'; // Import Observable
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
  private storeContext = inject(StoreContextService); // Inject StoreContextService
  currentStoreSlug$: Observable<string | null> = this.storeContext.currentStoreSlug$; // Expose slug observable
}
