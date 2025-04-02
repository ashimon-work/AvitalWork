import { Component, OnInit, OnDestroy } from '@angular/core'; // Added OnInit, OnDestroy
import { CommonModule } from '@angular/common'; // For *ngIf
import { RouterLink } from '@angular/router'; // For routerLink directives
import { NavigationComponent } from '../navigation/navigation.component'; // Import Navigation
import { SearchBarComponent } from '../search-bar/search-bar.component'; // Import Search Bar
import { CartService } from '../../services/cart.service'; // Import CartService
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

  // Inject CartService
  constructor(private cartService: CartService) {}

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
}
