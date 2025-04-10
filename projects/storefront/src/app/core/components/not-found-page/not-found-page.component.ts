import { Component, inject } from '@angular/core'; // Import inject
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // For routerLink
import { Observable } from 'rxjs'; // Import Observable
import { StoreContextService } from '../../services/store-context.service'; // Import StoreContextService

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterModule], // Import RouterModule for Back to Home link
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss'] // Corrected property name
})
export class NotFoundPageComponent {
  private storeContextService = inject(StoreContextService); // Inject service

  // Expose the store slug observable to the template
  currentStoreSlug$: Observable<string | null> = this.storeContextService.currentStoreSlug$;

  // Add logic here later if needed (e.g., fetching suggested pages)
  constructor() {}
}