import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for async pipe, *ngIf
import { AuthService } from '../../core/services/auth.service'; // Import AuthService
import { Observable } from 'rxjs';
import { User } from '@shared-types'; // Import User type

@Component({
  selector: 'app-account-overview',
  standalone: true,
  imports: [CommonModule], // Add CommonModule
  templateUrl: './account-overview.component.html',
  styleUrl: './account-overview.component.scss'
})
export class AccountOverviewComponent {
  private authService = inject(AuthService); // Inject AuthService

  // Expose the currentUser observable to the template
  currentUser$: Observable<Omit<User, 'passwordHash'> | null> = this.authService.currentUser$;

  // You could also use a snapshot if needed, but observable is preferred for reactivity
  // get currentUserSnapshot() {
  //   return this.authService.getCurrentUserSnapshot();
  // }
}
