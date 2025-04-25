import { Component, OnInit, OnDestroy, inject } from '@angular/core'; // Added OnDestroy, inject
import { Observable, Subscription } from 'rxjs'; // Added Subscription
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service'; // Added CartService
import { CommonModule } from '@angular/common';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule, NotificationToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy { // Implemented OnDestroy
  isAuthenticated$!: Observable<boolean>;
  showCartNotification = false;
  private notificationTimeout: any = null; // Using 'any' for Node.js/Browser compatibility
  private itemAddedSubscription: Subscription | null = null;

  private authService = inject(AuthService); // Using inject
  private cartService = inject(CartService); // Using inject

  // Removed constructor injection, using inject() instead

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
        this.notificationTimeout = null; // Clear the timeout reference
      }, 2000);
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.itemAddedSubscription) {
      this.itemAddedSubscription.unsubscribe();
    }
    // Clear timeout if component is destroyed before it fires
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }
}
