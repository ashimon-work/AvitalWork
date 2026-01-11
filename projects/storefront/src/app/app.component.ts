import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { CommonModule } from '@angular/common';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';
import { CategoryNavigationComponent } from './shared/components/category-navigation/category-navigation.component';
import { CategoryDropdownService } from './core/services/category-dropdown.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule, NotificationToastComponent, TranslatePipe, CategoryNavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  public tKeys = T;
  isAuthenticated$!: Observable<boolean>;
  showCartNotification = false;
  isCategoryDropdownOpen = false;
  private notificationTimeout: any = null;
  private itemAddedSubscription: Subscription | null = null;
  private dropdownSubscription: Subscription | null = null;

  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private categoryDropdownService = inject(CategoryDropdownService);

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated$;

    // Subscribe to item added events
    this.itemAddedSubscription = this.cartService.itemAdded$.subscribe(() => {
      this.showCartNotification = true;
      // Clear previous timeout if one exists
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
      // Set new timeout to hide after 2 seconds
      this.notificationTimeout = setTimeout(() => {
        this.showCartNotification = false;
        this.notificationTimeout = null;
      }, 2000);
    });

    // Subscribe to category dropdown state
    this.dropdownSubscription = this.categoryDropdownService.dropdownState.subscribe((isOpen) => {
      this.isCategoryDropdownOpen = isOpen;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.itemAddedSubscription) {
      this.itemAddedSubscription.unsubscribe();
    }
    if (this.dropdownSubscription) {
      this.dropdownSubscription.unsubscribe();
    }
    // Clear timeout if component is destroyed before it fires
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  closeCategoryDropdown(): void {
    this.categoryDropdownService.close();
  }
}
