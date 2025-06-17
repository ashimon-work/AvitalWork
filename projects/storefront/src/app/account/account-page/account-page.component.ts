import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AccountStatsBarComponent } from '../components/account-stats-bar/account-stats-bar.component';
import { ApiService, AccountOverviewDto } from '../../core/services/api.service';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { StoreContextService } from '../../core/services/store-context.service';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, MatButtonModule, MatDividerModule, AccountStatsBarComponent],
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.scss'
})
export class AccountPageComponent {
  public tKeys = T;
  isMobileMenuOpen = false;

  // Real user data from API
  accountData$: Observable<{ totalOrders: number; rewardPoints: number } | null>;

  // Inject services
  constructor(
    private authService: AuthService, 
    private el: ElementRef,
    private apiService: ApiService,
    private storeContextService: StoreContextService
  ) {
      // Get real data from API - get total orders count from getUserOrders
    this.accountData$ = this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        return this.apiService.getUserOrders(1, 1, storeSlug).pipe(
          map(ordersData => ({
            totalOrders: ordersData.total || 0,
            rewardPoints: 0 // Backend doesn't have reward points system yet, so defaulting to 0
          })),
          catchError(error => {
            console.error('Error loading account orders data:', error);
            return of({ totalOrders: 0, rewardPoints: 0 });
          })
        );
      }),
      catchError(error => {
        console.error('Error with store context:', error);
        return of({ totalOrders: 0, rewardPoints: 0 });
      })
    );
  }

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
