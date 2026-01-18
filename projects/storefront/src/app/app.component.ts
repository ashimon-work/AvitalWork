import { Component, OnInit, OnDestroy, inject, Input } from '@angular/core'; // Added OnDestroy, inject
import { Observable, Subscription } from 'rxjs'; // Added Subscription
import { RouterOutlet, Router } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';
import { CartDrawerComponent } from './cart/components/cart-drawer/cart-drawer.component';
import { CartService } from './core/services/cart.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    NotificationToastComponent,
    TranslatePipe,
    CartDrawerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private router: Router) { } // Implemented OnDestroy
  public tKeys = T;
  isAuthenticated$!: Observable<boolean>;
  showCartNotification = false;
  private notificationTimeout: any = null; // Using 'any' for Node.js/Browser compatibility
  private itemAddedSubscription: Subscription | null = null;

  private authService = inject(AuthService); // Using inject
  private cartService = inject(CartService); // Using inject

  // Removed constructor injection, using inject() instead
  @Input() variant: 'transparent' | 'light' | 'dark' = 'transparent';
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
  getHeaderVariant(): 'transparent' | 'light' | 'dark' {
    const currentUrl = this.router.url;

    // Handle store slugs in URL
    const urlParts = currentUrl.split('/');
    const pathWithoutStore = urlParts.length > 2 ? '/' + urlParts.slice(2).join('/') : currentUrl;

    // Use transparent (white text) for the homepage (both root and store homepage)
    if (pathWithoutStore === '/' || (urlParts.length === 2 && urlParts[1] !== '')) {
      return 'transparent';
    }

    // Use dark (black text) for all other pages
    return 'dark';
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
