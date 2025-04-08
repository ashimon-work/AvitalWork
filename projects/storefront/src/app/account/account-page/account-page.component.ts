import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf etc. if needed later
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.scss'
})
export class AccountPageComponent {
  isMobileMenuOpen = false; // State for mobile menu

  // Inject AuthService
  constructor(private authService: AuthService) {}

  // Method to toggle mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Method to handle logout
  logout(): void {
    this.authService.logout();
    // Navigation is handled within AuthService.logout()
  }
}
