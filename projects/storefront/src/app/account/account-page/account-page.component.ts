import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.scss'
})
export class AccountPageComponent {
  isMobileMenuOpen = false;

  // Inject AuthService
  constructor(private authService: AuthService, private el: ElementRef) {}

  // Method to toggle mobile menu
  toggleMobileMenu(): void {
    console.log('toggleMobileMenu called');
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Method to handle logout
  logout(): void {
    this.authService.logout();
    // Navigation is handled within AuthService.logout()
  }

}
