import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, ShippingMethod, AddressDto } from '../../core/services/api.service';
import { T, TranslatePipe, I18nService } from '@shared/i18n';
import { CartService } from '../../core/services/cart.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { Observable, combineLatest, switchMap, tap, of, BehaviorSubject } from 'rxjs';
import { Cart, CartItem } from 'projects/shared-types/src/lib/cart.interface';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { CheckoutProgressIndicatorComponent } from '../components/checkout-progress-indicator/checkout-progress-indicator.component';
import { ShippingAddressFormComponent, ShippingAddressData } from '../components/shipping-address-form/shipping-address-form.component';
import { PaymentMethodSectionComponent } from '../components/payment-method-section/payment-method-section.component';
import { OrderSummaryCardComponent, OrderItem } from '../components/order-summary-card/order-summary-card.component';
import { ShippingMethodComponent } from '../components/shipping-method/shipping-method.component';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CheckoutProgressIndicatorComponent,
    ShippingAddressFormComponent,
    PaymentMethodSectionComponent,
    OrderSummaryCardComponent,
    ShippingMethodComponent,
    TranslatePipe
  ],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss'],
  providers: [I18nService]
})
export class CheckoutPageComponent implements OnInit {
  public tKeys = T;
  cart$: Observable<Cart | null>;
  shippingMethods$: BehaviorSubject<ShippingMethod[]> = new BehaviorSubject<ShippingMethod[]>([]);
  selectedShippingMethod: ShippingMethod | null = null;
  taxEstimate$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  orderTotal$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  isLoading: boolean = false;
  // currentStep is no longer needed, page will be a single step.
  // currentStep: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  // Tranzila integration
  hasCreditCard$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  creditCardInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isCheckingCard: boolean = false;

  // New properties for child components
  shippingAddressData: ShippingAddressData | null = null;
  storedCard: { last4: string; brand: string; } | undefined = undefined;
  orderItems: OrderItem[] = [];


  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private storeContextService: StoreContextService,
    private notificationService: NotificationService,
    private router: Router,
    private i18nService: I18nService
  ) {
    this.cart$ = this.cartService.cartState$;
  }

  ngOnInit(): void {
    this.loadShippingMethods();
    this.subscribeToCartChanges();
    this.checkCreditCardStatus();
  }

  loadShippingMethods(): void {
    this.isLoading = true;
    this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          const storeContextErrorMsg = this.i18nService.translate(this.tKeys.SF_CHECKOUT_NOTIFICATION_STORE_CONTEXT_ERROR);
          this.notificationService.showError(storeContextErrorMsg);
          return of([]);
        }
        return this.apiService.getShippingMethods(storeSlug);
      })
    ).subscribe(methods => {
      this.shippingMethods$.next(methods);
      this.isLoading = false;
      if (methods.length > 0) {
        // Pre-select the first method if not already set or if current selection is invalid
        if (!this.selectedShippingMethod || !methods.find(m => m.id === this.selectedShippingMethod?.id)) {
          this.selectedShippingMethod = methods[0];
          this.cart$.subscribe(cart => {
            if (cart) this.calculateTotals(cart)
          });
        }
      } else {
        const noShippingInfoMsg = this.i18nService.translate(this.tKeys.SF_CHECKOUT_NOTIFICATION_NO_SHIPPING_METHODS);
        this.notificationService.showInfo(noShippingInfoMsg); // Changed to showInfo
      }
    });
  }

  subscribeToCartChanges(): void {
    this.cart$.subscribe(cart => {
      if (cart) {
        this.orderItems = cart.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          options: '', // Add logic to get options if available
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.imageUrls?.[0] || ''
        }));
        this.calculateTotals(cart);
      }
    });
  }

  calculateTotals(cart: Cart): void {
    const shippingCost = this.selectedShippingMethod?.cost || 0;
    // Tax calculation logic will be simplified for now
    const taxAmount = (cart.subtotal || 0) * 0.1; // Example 10% tax
    this.taxEstimate$.next(taxAmount);
    this.orderTotal$.next((cart.subtotal || 0) + shippingCost + taxAmount);
  }


  // --- Multi-step form navigation removed ---

  handleShippingSubmit(data: ShippingAddressData) {
    this.shippingAddressData = data;
  }

  handleShippingMethodChange(method: ShippingMethod) {
    this.selectedShippingMethod = method;
    this.cart$.subscribe(cart => {
      if (cart) {
        this.calculateTotals(cart);
      }
    });
  }

  handleCardUpdate(card: { last4: string; brand: string; }) {
    this.storedCard = card;
  }

  canPlaceOrder(): boolean {
    return !!this.shippingAddressData && !!this.storedCard && this.shippingAddressData.terms;
  }

  placeOrder(): void {
    if (!this.shippingAddressData || !this.storedCard) {
      this.notificationService.showError('Please complete all steps.');
      return;
    }

    this.isLoading = true;
    const splitName = (fullName: string) => {
      const parts = fullName.trim().split(' ');
      if (parts.length === 1) {
        // If only one word, use it as firstName and leave lastName empty
        return { firstName: parts[0], lastName: '' };
      }
      // Otherwise, first word is firstName, rest is lastName
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' ')
      };
    };

    const nameParts = splitName(this.shippingAddressData.fullName);

    // Get current cart and ensure it's not null
    const currentCart = this.cartService.getCurrentCart();
    if (!currentCart) {
      this.notificationService.showError('Cart is empty. Please add items to your cart.');
      this.isLoading = false;
      return;
    }

    // Calculate totals to ensure they're not NaN
    const subtotal = Number(currentCart.subtotal) || 0;
    const shippingCost = Number(this.selectedShippingMethod?.cost) || 0;
    const taxAmount = Number(this.taxEstimate$.value) || 0;
    const total = subtotal + shippingCost + taxAmount;

    const orderData = {
      storeSlug: this.storeContextService.getCurrentStoreSlug(),
      cartItems: currentCart.items.map((item: CartItem) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })),
      shippingAddress: {
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        address1: this.shippingAddressData.address1,
        address2: this.shippingAddressData.address2,
        city: this.shippingAddressData.city,
        zipCode: this.shippingAddressData.zip,
        country: this.shippingAddressData.country,
      },
      billingAddress: { // Assuming same as shipping for now
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        address1: this.shippingAddressData.address1,
        address2: this.shippingAddressData.address2,
        city: this.shippingAddressData.city,
        zipCode: this.shippingAddressData.zip,
        country: this.shippingAddressData.country,
      },
      shippingMethodId: this.selectedShippingMethod?.id,
      newsletterOptIn: this.shippingAddressData.newsletter,
      termsAccepted: this.shippingAddressData.terms,
      subtotal: subtotal,
      shippingCost: shippingCost,
      taxAmount: taxAmount,
      total: total
    };

    this.apiService.placeOrder(orderData).subscribe({
      next: (response: { orderId: string, orderNumber: string }) => {
        this.isLoading = false;
        const successMessage = this.i18nService.translate(this.tKeys.SF_CHECKOUT_NOTIFICATION_ORDER_SUCCESS, { orderNumber: response.orderNumber } as any);
        this.notificationService.showSuccess(successMessage);
        this.cartService.loadInitialCart();
        const storeSlug = this.storeContextService.getCurrentStoreSlug();
        this.router.navigate(['/', storeSlug, 'order-confirmation', response.orderId]);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.notificationService.showError(error.error?.message || 'Failed to place order.');
        console.error('Error placing order:', error);
      }
    });
  }

  public get creditCardDisplay(): string {
    const cardInfo = this.creditCardInfo$.value;
    if (cardInfo && cardInfo.lastFour) {
      return `•••• •••• •••• ${cardInfo.lastFour}`;
    }
    return '';
  }

  checkCreditCardStatus(): void {
    this.isCheckingCard = true;
    this.apiService.checkCreditCardStatus().subscribe({
      next: (result) => {
        const hasCard = result && result.hasCard;
        this.hasCreditCard$.next(hasCard);
        if (hasCard && result.cardInfo) {
          this.creditCardInfo$.next(result.cardInfo);
          this.storedCard = { last4: result.cardInfo.lastFour, brand: 'Visa' }; // Assuming Visa for now
        }
        this.isCheckingCard = false;
      },
      error: (error) => {
        this.hasCreditCard$.next(false);
        this.isCheckingCard = false;
        console.log('Error checking credit card status:', error);
      }
    });
  }

  addCreditCard(): void {
    this.isLoading = true;
    this.apiService.getTranzilaTokenizationUrl().subscribe({
      next: (response) => {
        // Open Tranzila tokenization page in a new window with secure iframe
        const tokenizationWindow = window.open(
          response.tokenizationUrl,
          'tranzila-tokenization',
          'width=500,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no'
        );

        if (!tokenizationWindow) {
          this.isLoading = false;
          const popupBlockedMsg = this.i18nService.translate(this.tKeys.SF_CHECKOUT_NOTIFICATION_CARD_TOKENIZATION_ERROR);
          this.notificationService.showError(popupBlockedMsg);
          return;
        }

        // Listen for the window to close and refresh card status
        const checkClosed = setInterval(() => {
          if (tokenizationWindow?.closed) {
            clearInterval(checkClosed);
            this.isLoading = false;
            // Show success dialog and refresh card status after delay
            setTimeout(() => {
              this.showCardSavedDialog();
              this.checkCreditCardStatus();
            }, 1500);
          }
        }, 1000);

        // Also listen for navigation events in the popup (if accessible)
        try {
          tokenizationWindow.addEventListener('beforeunload', () => {
            setTimeout(() => {
              if (tokenizationWindow.closed) {
                clearInterval(checkClosed);
                this.isLoading = false;
                this.showCardSavedDialog();
                this.checkCreditCardStatus();
              }
            }, 1000);
          });
        } catch (error) {
          // Cross-origin restrictions might prevent this - that's okay
          console.log('Cross-origin restrictions prevent popup monitoring');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMsg = this.i18nService.translate(this.tKeys.SF_CHECKOUT_NOTIFICATION_CARD_TOKENIZATION_ERROR);
        this.notificationService.showError(errorMsg);
        console.error('Error getting tokenization URL:', error);
      }
    });
  }

  private showCardSavedDialog(): void {
    // Use a simple success message for card saving
    this.notificationService.showSuccess('Payment details saved successfully!');
  }

  removeCreditCard(): void {
    // For now, we'll just show a message that the user needs to contact support
    // In a full implementation, you might want to add a backend endpoint to remove cards
    const removeCardMsg = this.i18nService.translate(this.tKeys.SF_CHECKOUT_NOTIFICATION_REMOVE_CARD_CONTACT_SUPPORT);
    this.notificationService.showInfo(removeCardMsg);
  }
}
