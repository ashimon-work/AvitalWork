import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core'; // Added OnInit, OnDestroy
import { CommonModule } from '@angular/common'; // For *ngIf
import { RouterLink } from '@angular/router'; // For routerLink directives
import { NavigationComponent } from '../navigation/navigation.component'; // Import Navigation
import { SearchBarComponent } from '../search-bar/search-bar.component'; // Import Search Bar
import { CartService } from '../../services/cart.service'; // Import CartService
import { StoreContextService } from '../../services/store-context.service'; // Import StoreContextService
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { Observable, Subscription } from 'rxjs'; // Import Observable and Subscription

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavigationComponent,
    SearchBarComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount$: Observable<number> | undefined;
  cartItemCount: number = 0; // For direct binding in template
  private cartCountSubscription: Subscription | undefined;
  currentStoreSlug$: Observable<string | null>; // Add slug observable
  isAuthenticated$: Observable<boolean>; // Add auth state observable
  isMobileMenuOpen: boolean = false; // State for mobile menu toggle

  // Inject CartService, StoreContextService, and AuthService
  constructor(
    private cartService: CartService,
    private storeContext: StoreContextService,
    private authService: AuthService, // Inject AuthService
    private el: ElementRef
  ) {
    this.currentStoreSlug$ = this.storeContext.currentStoreSlug$; // Assign slug observable
    this.isAuthenticated$ = this.authService.isAuthenticated$; // Assign auth state observable
  }

  ngOnInit() {
    // Subscribe to the cart count observable
    this.cartItemCount$ = this.cartService.getItemCount();
    this.cartCountSubscription = this.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
      console.log('Cart count updated in header:', count); // For debugging
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.cartCountSubscription) {
      this.cartCountSubscription.unsubscribe();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event): void {
    if (!this.el.nativeElement.contains(event.target) && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
