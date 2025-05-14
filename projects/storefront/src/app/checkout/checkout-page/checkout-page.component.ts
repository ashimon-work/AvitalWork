import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms'; // Added AbstractControl, ValidationErrors
import { CommonModule } from '@angular/common';
import { ApiService, ShippingMethod } from '../../core/services/api.service'; // Import ShippingMethod
import { CartService } from '../../core/services/cart.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { Observable, combineLatest, switchMap, tap, of, BehaviorSubject } from 'rxjs'; // Added of, BehaviorSubject
import { Cart, CartItem } from 'projects/shared-types/src/lib/cart.interface';
import { NotificationService } from '../../core/services/notification.service'; // For user feedback
import { Router } from '@angular/router'; // For navigation

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss'
})
export class CheckoutPageComponent implements OnInit {
  checkoutForm!: FormGroup;
  cart$: Observable<Cart | null>;
  shippingMethods$: BehaviorSubject<ShippingMethod[]> = new BehaviorSubject<ShippingMethod[]>([]);
  selectedShippingMethod: ShippingMethod | null = null;
  taxEstimate$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  orderTotal$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  isLoading: boolean = false;
  currentStep: BehaviorSubject<number> = new BehaviorSubject<number>(1); // For multi-step UI

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private cartService: CartService,
    private storeContextService: StoreContextService,
    private notificationService: NotificationService, // Inject NotificationService
    private router: Router // Inject Router
  ) {
    this.cart$ = this.cartService.cartState$;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadShippingMethods();
    this.subscribeToCartChanges();
  }

  initForm(): void {
    this.checkoutForm = this.fb.group({
      shippingAddress: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        address1: ['', Validators.required],
        address2: [''],
        city: ['', Validators.required],
        // state: ['', Validators.required], // Removed state based on memory bank
        zipCode: ['', Validators.required],
        country: [{ value: 'Israel', disabled: true }, Validators.required] // Default to Israel and disable
      }),
      billingAddressSameAsShipping: [true],
      billingAddress: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        address1: ['', Validators.required],
        address2: [''],
        city: ['', Validators.required],
        // state: ['', Validators.required], // Removed state based on memory bank
        zipCode: ['', Validators.required],
        country: [{ value: 'Israel', disabled: true }, Validators.required] // Default to Israel and disable
      }),
      shippingMethod: ['', Validators.required],
      paymentInfo: this.fb.group({
        cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{13,19}$/), this.luhnValidator.bind(this)]],
        expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]], // MM/YY
        cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
      }),
      newsletterOptIn: [false],
      termsAccepted: [false, Validators.requiredTrue]
    });

    // Disable billing address initially if same as shipping
    this.checkoutForm.get('billingAddressSameAsShipping')?.valueChanges.subscribe(value => {
      const billingAddressGroup = this.checkoutForm.get('billingAddress');
      if (value) {
        billingAddressGroup?.disable();
      } else {
        billingAddressGroup?.enable();
      }
    });
  }

  loadShippingMethods(): void {
    this.isLoading = true;
    this.storeContextService.currentStoreSlug$.pipe(
      switchMap(storeSlug => {
        if (!storeSlug) {
          this.notificationService.showError('Store context not found. Cannot load shipping methods.');
          return of([]);
        }
        return this.apiService.getShippingMethods(storeSlug);
      })
    ).subscribe(methods => {
      this.shippingMethods$.next(methods);
      this.isLoading = false;
      if (methods.length > 0) {
        // Pre-select the first method if not already set or if current selection is invalid
        const currentSelection = this.checkoutForm.get('shippingMethod')?.value;
        if (!currentSelection || !methods.find(m => m.id === currentSelection)) {
            this.checkoutForm.get('shippingMethod')?.setValue(methods[0].id);
            // selectedShippingMethod will be updated by the form's valueChanges subscription
        }
      } else {
        this.notificationService.showInfo('No shipping methods available for your location.'); // Changed to showInfo
      }
    });
  }

  // onShippingMethodChange is handled by form valueChanges

  subscribeToCartChanges(): void {
    combineLatest([
      this.cart$,
      this.checkoutForm.get('shippingAddress')!.valueChanges, // Potential null if form not ready
      this.checkoutForm.get('shippingMethod')!.valueChanges  // Potential null
    ]).pipe(
      switchMap(([cart, shippingAddress, shippingMethodId]) => {
        if (!cart || cart.items.length === 0) {
          this.orderTotal$.next(0);
          this.taxEstimate$.next(0);
          return of(null); // No cart, no further processing needed
        }

        const currentSelectedMethod = this.shippingMethods$.value.find(method => method.id === shippingMethodId);
        this.selectedShippingMethod = currentSelectedMethod || null;

        const storeSlug = this.storeContextService.getCurrentStoreSlug();
        if (storeSlug && shippingAddress && cart.items.length > 0) {
          // Prepare cart items for tax estimation
          const taxCartItems = cart.items.map(item => ({ productId: item.product.id, quantity: item.quantity }));
          return this.apiService.getTaxEstimate(storeSlug, taxCartItems, shippingAddress).pipe(
            tap(taxResponse => {
              this.taxEstimate$.next(taxResponse.taxAmount);
              this.updateOrderTotal(cart.subtotal, currentSelectedMethod?.cost || 0, taxResponse.taxAmount);
            }),
            // catchError inside getTaxEstimate handles individual errors, returning 0 tax
          );
        } else {
          // If no storeSlug, shippingAddress, or items, calculate total without tax
          this.taxEstimate$.next(0);
          this.updateOrderTotal(cart.subtotal, currentSelectedMethod?.cost || 0, 0);
          return of(null); // Indicate no tax call was made
        }
      })
    ).subscribe();
  }

  updateOrderTotal(cartSubtotal: number, shippingCost: number, taxAmount: number): void {
    this.orderTotal$.next(cartSubtotal + shippingCost + taxAmount);
  }

  // --- Multi-step form navigation ---
  nextStep(): void {
    if (this.currentStep.value < 3) { // Assuming 3 steps: Shipping, Billing/Payment, Review
      // Add validation for current step before proceeding
      if (this.currentStep.value === 1 && this.checkoutForm.get('shippingAddress')?.invalid) {
        this.checkoutForm.get('shippingAddress')?.markAllAsTouched();
        this.notificationService.showError('Please fill in all required shipping address fields.');
        return;
      }
      if (this.currentStep.value === 1 && this.checkoutForm.get('shippingMethod')?.invalid) {
        this.checkoutForm.get('shippingMethod')?.markAsTouched();
        this.notificationService.showError('Please select a shipping method.');
        return;
      }
      // Add more step-specific validations as needed for step 2 (billing/payment)

      this.currentStep.next(this.currentStep.value + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep.value > 1) {
      this.currentStep.next(this.currentStep.value - 1);
    }
  }

  goToStep(step: number): void {
    // Potentially add validation before allowing direct step jumps
    this.currentStep.next(step);
  }
  // --- End multi-step form navigation ---


  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      // Mark all fields as touched to display validation errors
      this.checkoutForm.markAllAsTouched();
      console.error('Form is invalid. Cannot place order.');
      return;
    }

    if (!this.cartService.getCurrentCart() || this.cartService.getCurrentCart()!.items.length === 0) {
      console.error('Cart is empty. Cannot place order.');
      // TODO: Redirect to cart page or show an error message
      return;
    }

    this.isLoading = true;

    const formValue = this.checkoutForm.getRawValue(); // Use getRawValue to include disabled fields

    const orderData = {
      storeSlug: this.storeContextService.getCurrentStoreSlug(),
      cartItems: this.cartService.getCurrentCart()!.items.map((item: CartItem) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price // Use product price at time of order
      })),
      shippingAddress: formValue.shippingAddress,
      billingAddress: formValue.billingAddressSameAsShipping ? formValue.shippingAddress : formValue.billingAddress,
      shippingMethodId: formValue.shippingMethod,
      paymentInfo: formValue.paymentInfo, // TODO: This should be a token or reference, not raw card details
      newsletterOptIn: formValue.newsletterOptIn,
      termsAccepted: formValue.termsAccepted,
      // Include calculated totals for backend verification (optional but good practice)
      subtotal: this.cartService.getCurrentCart()!.subtotal,
      shippingCost: this.selectedShippingMethod?.cost || 0,
      taxAmount: this.taxEstimate$.value,
      total: this.orderTotal$.value
    };

    this.apiService.placeOrder(orderData).subscribe({
      next: (response: { orderId: string, orderNumber: string }) => { // Assuming backend returns orderId and orderNumber
        this.isLoading = false;
        this.notificationService.showSuccess(`Order #${response.orderNumber} placed successfully!`);
        // Backend should clear the cart. Frontend reloads cart state.
        this.cartService.loadInitialCart();
        const storeSlug = this.storeContextService.getCurrentStoreSlug();
        this.router.navigate(['/', storeSlug, 'order-confirmation', response.orderId]);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.notificationService.showError(error.error?.message || 'Failed to place order. Please try again.');
        console.error('Error placing order:', error);
      }
    });
  }

  // Helper for Luhn algorithm (basic credit card validation)
  isValidLuhn(cardNumber: string): boolean {
    if (/[^0-9-\s]+/.test(cardNumber)) return false;

    let nCheck = 0, bEven = false;
    cardNumber = cardNumber.replace(/\D/g, "");

    for (var n = cardNumber.length - 1; n >= 0; n--) {
      var cDigit = cardNumber.charAt(n),
          nDigit = parseInt(cDigit, 10);

      if (bEven && (nDigit *= 2) > 9) nDigit -= 9;

      nCheck += nDigit;
      bEven = !bEven;
    }
    return (nCheck % 10) == 0;
  }

  // TODO: Add specific validators for card number, expiry, CVV to the form init
  // Example for card number:
  // cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{13,19}$/), this.luhnValidator.bind(this)]],
  luhnValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Don't validate empty values, let `required` handle it
    }
    return this.isValidLuhn(control.value) ? null : { luhnInvalid: true };
  }
}
