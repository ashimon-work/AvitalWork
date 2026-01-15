import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, switchMap, tap, map, of, filter, catchError, combineLatest } from 'rxjs';
import { Product, Category, ProductVariant, ProductVariantOption } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { FeaturedProductCardComponent } from '../../shared/components/featured-product-card/featured-product-card.component';
import { T, TranslatePipe } from '@shared/i18n';
import { I18nService } from '@shared/i18n';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FeaturedProductCardComponent,
    TranslatePipe
  ],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.scss'
})
export class ProductPageComponent implements OnInit {
  public tKeys = T;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cartService = inject(CartService);
  private storeContext = inject(StoreContextService);
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private recentlyViewedService = inject(RecentlyViewedService); // Added injection
  private i18nService = inject(I18nService);

  public currentStoreSlug$ = this.storeContext.currentStoreSlug$;
  private cacheBuster = '&t=' + Date.now();
  categoryId$: Observable<string | null>;
  product$: Observable<Product | null> | undefined;
  public product: Product | null = null;
  category$: Observable<Category | null>;
  quantity: number = 1;

  // New properties for variant selection and display
  availableOptions: { name: string, values: { value: string, disabled: boolean }[] }[] = [];
  selectedOptions: { [key: string]: string } = {};
  selectedVariant: ProductVariant | null = null;
  currentPrice: number | undefined;
  currentStock: number | undefined;

  isLoggedIn$: Observable<boolean> = this.authService.isAuthenticated$;

  // Image gallery
  selectedImageIndex: number = 0;

  // Description
  showFullDescription: boolean = false;
  descriptionPreviewLength: number = 200;

  // New property for related products
  relatedProducts: Product[] = [];

  // New property for product category
  productCategory: Category | null = null;

  // Property to track if the current product is in the wishlist
  isInWishlist: boolean = false;

  @ViewChild('relatedContainer', { static: false }) relatedContainer!: ElementRef<HTMLDivElement>;

  constructor(private activatedRoute: ActivatedRoute) {
    this.categoryId$ = this.activatedRoute.queryParamMap.pipe(
      map(params => params.get('categoryId'))
    );
    this.category$ = this.categoryId$.pipe(
      filter((id): id is string => !!id), // Ensure categoryId is not null
      switchMap(categoryId => this.apiService.getCategoryDetails(categoryId).pipe(
        tap(category => {
          if (!category) {
            console.warn(`Category with ID ${categoryId} not found for breadcrumb.`);
            // Don't redirect, maybe just don't show category in breadcrumb
          }
        }),
        catchError((err: any) => { // Added type for err
          console.error('Error fetching category details:', err);
          return of(null); // Return null observable on error, breadcrumb can handle this
        })
      ))
    );
  }

  ngOnInit(): void {
    // Fetch Product Details
    this.product$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id), // Ensure id is not null/undefined
      tap(id => {
        if (!id) { // Double check, though filter should prevent this
          console.error('Product ID missing from route');
          this.router.navigate(['/']);
        }
      }),
      switchMap(id => {
        if (!id) {
          return new Observable<Product | null>(subscriber => subscriber.next(null));
        }
        // Fetch product details, related products, and category in parallel
        return combineLatest([
          this.apiService.getProductDetails(id),
          this.apiService.getRelatedProducts(id)
        ]).pipe(
          tap(([product, relatedProducts]) => {
            if (!product) {
              console.error(`Product with ID ${id} not found`);
              this.router.navigate(['/not-found']);
            } else {
              this.product = product;
              // Initialize variant selection and display data
              this.initializeVariantData(product);
              this.relatedProducts = relatedProducts.slice(0, 4);
              // Reset image index for new product
              this.selectedImageIndex = 0;
              if (product.id) { // Add product to recently viewed
                this.recentlyViewedService.addProduct(product.id);
              }

              // Fetch category details for breadcrumbs if categories exist
              if (product.categories && product.categories.length > 0) {
                // Fetch details for the first category ID
                this.apiService.getCategoryDetails(product.categories[0].id).subscribe({
                  next: (category) => {
                    this.productCategory = category;
                    console.log('Fetched product category for breadcrumbs:', category?.name);
                  },
                  error: (err) => {
                    console.error('Failed to fetch product category for breadcrumbs:', err);
                    this.productCategory = null;
                  }
                });
              } else {
                this.productCategory = null;
              }

              // Check if the product is in the wishlist if the user is logged in
              this.authService.isAuthenticated$.subscribe(isLoggedIn => {
                if (isLoggedIn && product?.id) {
                  this.checkIfInWishlist(product.id);
                } else {
                  this.isInWishlist = false; // Not logged in or no product ID
                }
              });
            }
          }),
          map(([product, relatedProducts]) => product)
        );
      })
    );
  }



  // Initialize variant data and set initial selected variant
  private initializeVariantData(product: Product): void {
    if (product.options && product.options.length > 0 && product.variants && product.variants.length > 0) {
      // Build available options structure
      this.availableOptions = product.options.map(optionName => {
        const valueSet = new Set<string>();
        product.variants!.forEach(variant => {
          const option = variant.options.find(opt => opt.name === optionName);
          if (option) {
            valueSet.add(option.value);
          }
        });
        // Sort values alphabetically for consistent display
        const sortedValues = Array.from(valueSet).sort().map(val => ({ value: val, disabled: false }));
        // Select the first value of each option by default
        if (sortedValues.length > 0) {
          this.selectedOptions[optionName] = sortedValues[0].value;
        }
        return { name: optionName, values: sortedValues };
      });

      // Set the initial selected variant based on default selections
      this.updateSelectedVariant(product);
      // After selectedOptions are set, update availability based on stock
      this.updateAvailableOptionsWithStock(product);

    } else {
      // No variants, use base product data
      this.currentPrice = product.price;
      this.currentStock = product.stockLevel;
      this.selectedVariant = null;
    }
  }

  // Update the selected variant based on current selectedOptions
  private updateSelectedVariant(product: Product): void {
    if (!product.variants || product.variants.length === 0) {
      this.selectedVariant = null;
      this.currentPrice = product.price;
      this.currentStock = product.stockLevel;
      return;
    }

    // Find the variant that matches all selected options
    const matchedVariant = product.variants.find(variant => {
      // Check if every selected option matches one of the variant's options
      return Object.keys(this.selectedOptions).every(optionName => {
        const selectedValue = this.selectedOptions[optionName];
        return variant.options.some(opt => opt.name === optionName && opt.value === selectedValue);
      });
    });

    this.selectedVariant = matchedVariant || null;

    // Update price and stock based on selected variant or fallback to base product
    this.currentPrice = this.selectedVariant?.price ?? product.price;
    this.currentStock = this.selectedVariant?.stockLevel ?? product.stockLevel;

    // Reset quantity if current quantity exceeds new stock level
    if (this.quantity > this.currentStock) {
      this.quantity = this.currentStock > 0 ? 1 : 0;
    }
    // Ensure quantity is at least 1 if stock allows
    if (this.currentStock > 0 && this.quantity === 0) {
      this.quantity = 1;
    }
  }

  // Handle change in a variant option dropdown
  onOptionChange(optionName: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedOptions[optionName] = selectElement.value;
    // Re-evaluate the selected variant and update display
    if (this.product) {
      this.updateSelectedVariant(this.product);
      this.updateAvailableOptionsWithStock(this.product);
    }
  }

  private updateAvailableOptionsWithStock(product: Product): void {
    if (!product.variants || product.variants.length === 0 || !this.availableOptions) {
      return; // No variants or options to update
    }

    this.availableOptions.forEach(optionType => {
      optionType.values.forEach(optionValue => {
        // Assume not disabled initially for this check
        let isValueDisabled = true;

        // Create a temporary selection state including the current option value being tested
        const tempSelectedOptions = { ...this.selectedOptions };
        tempSelectedOptions[optionType.name] = optionValue.value;

        // Check if any variant matches this temporary selection and is in stock
        for (const variant of product.variants!) {
          let matchesAllTempOptions = true;
          for (const selectedKey in tempSelectedOptions) {
            const variantOption = variant.options.find(opt => opt.name === selectedKey);
            if (!variantOption || variantOption.value !== tempSelectedOptions[selectedKey]) {
              matchesAllTempOptions = false;
              break;
            }
          }

          if (matchesAllTempOptions && variant.stockLevel > 0) {
            isValueDisabled = false;
            break;
          }
        }
        optionValue.disabled = isValueDisabled;
      });
    });
  }

  // Method to handle adding to cart
  onAddToCart(product: Product | null): void {
    if (!product) {
      console.error('Cannot add null product to cart');
      return;
    }
    if (this.quantity < 1) {
      console.warn('Quantity must be at least 1');
      this.quantity = 1;
      // Optionally show user feedback
      return;
    }
    console.log(`Adding ${this.quantity} of ${product.name} (Variant: ${this.selectedVariant?.id || 'Base'}) to cart`);

    // Use the selected variant ID if available, otherwise use the base product ID
    // Also use the currentPrice which reflects the variant price if applicable
    const itemToAdd = this.selectedVariant ? { ...product, id: this.selectedVariant.id, price: this.currentPrice! } as Product : product;

    this.cartService.addItem(itemToAdd, this.quantity).subscribe({
      next: () => {
        console.log('Item added successfully via service');
        this.notificationService.showSuccess(
          this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_SUCCESS_NOTIFICATION, this.quantity, product.name)
        );
        // TODO: Add button state change (e.g., temporarily disable or show added state)
      },
      error: (err: any) => {
        console.error('Failed to add item via service:', err);
        this.notificationService.showError(this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_CART_ERROR_NOTIFICATION));
      }
    });
  }

  // Method to handle quantity changes from input (optional, can use +/- buttons later)
  onQuantityChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newQuantity = parseInt(inputElement.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= (this.currentStock || 0)) {
      this.quantity = newQuantity;
    } else {
      // Optionally revert to previous valid quantity or show error
      console.warn('Invalid quantity entered');
      // Revert to current quantity state to prevent invalid input
      inputElement.value = this.quantity.toString();
    }
  }

  // Method to handle quantity increment
  incrementQuantity(): void {
    if (this.quantity < (this.currentStock || 0)) {
      this.quantity++;
    }
  }

  // Method to handle quantity decrement
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Method to handle adding/removing from wishlist
  toggleWishlist(product: Product | null): void {
    if (!product) {
      console.error('Cannot toggle wishlist: Product is null');
      return;
    }

    if (this.isInWishlist) {
      // Remove from wishlist
      this.wishlistService.removeItem(product.id).subscribe({
        next: () => {
          console.log(`Product ${product.id} removed from wishlist`);
          this.isInWishlist = false;
          this.notificationService.showInfo(
            this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_REMOVE_FROM_WISHLIST_SUCCESS_NOTIFICATION, product.name)
          );
        },
        error: (err: any) => {
          console.error('Failed to remove item from wishlist:', err);
          this.notificationService.showError(
            this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_REMOVE_FROM_WISHLIST_ERROR_NOTIFICATION)
          );
        }
      });
    } else {
      // Add to wishlist
      this.wishlistService.addItem(product.id).subscribe({
        next: () => {
          console.log(`Product ${product.id} added to wishlist`);
          this.isInWishlist = true;
          this.notificationService.showSuccess(
            this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_WISHLIST_SUCCESS_NOTIFICATION, product.name)
          );
        },
        error: (err: any) => {
          console.error('Failed to add item to wishlist:', err);
          this.notificationService.showError(
            this.i18nService.translate(this.tKeys.SF_PRODUCT_PAGE_ADD_TO_WISHLIST_ERROR_NOTIFICATION)
          );
        }
      });
    }
  }



  // Method to check if the current product is in the user's wishlist
  private checkIfInWishlist(productId: string): void {
    this.wishlistService.refreshWishlist().subscribe({
      next: (wishlistDto) => {
        if (wishlistDto && wishlistDto.items) {
          this.isInWishlist = wishlistDto.items.some(item => item.productId === productId);
        } else {
          this.isInWishlist = false;
        }
        console.log(`Product ${productId} is in wishlist: ${this.isInWishlist}`);
      },
      error: (err: any) => {
        console.error('Failed to fetch wishlist to check product status:', err);
        this.isInWishlist = false;
      }
    });
  }

  // Image navigation methods
  handlePrevImage(): void {
    if (this.product && this.product.imageUrls && this.product.imageUrls.length > 1) {
      this.selectedImageIndex = this.selectedImageIndex === 0
        ? this.product.imageUrls.length - 1
        : this.selectedImageIndex - 1;
    }
  }

  handleNextImage(): void {
    if (this.product && this.product.imageUrls && this.product.imageUrls.length > 1) {
      this.selectedImageIndex = this.selectedImageIndex === this.product.imageUrls.length - 1
        ? 0
        : this.selectedImageIndex + 1;
    }
  }

  setSelectedImageIndex(index: number): void {
    this.selectedImageIndex = index;
  }

  // Related products scroll method
  scrollRelated(direction: 'left' | 'right'): void {
    if (this.relatedContainer) {
      const scrollAmount = 300;
      this.relatedContainer.nativeElement.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  // Description toggle method
  toggleDescription(): void {
    this.showFullDescription = !this.showFullDescription;
  }

  // Computed getters for template
  get displayedDescription(): string {
    if (!this.product) return '';
    const desc = this.product.description || '';
    if (!desc) return '';
    const isLong = desc.length > this.descriptionPreviewLength;
    return this.showFullDescription || !isLong
      ? desc
      : desc.slice(0, this.descriptionPreviewLength) + "...";
  }

  get isLongDescription(): boolean {
    if (!this.product) return false;
    const desc = this.product.description || '';
    return desc.length > this.descriptionPreviewLength;
  }

  get savings(): number {
    if (!this.product) return 0;
    let price = this.currentPrice || 0;
    // Assuming no originalPrice for now, savings is 0
    return 0;
  }

  getImageUrl(index: number): string {
    if (!this.product || !this.product.imageUrls || index >= this.product.imageUrls.length) {
      return '';
    }
    const url = this.product.imageUrls[index];
    const separator = url.includes('?') ? '&' : '?';
    return url + separator + 'v=1';
  }

  onImageError(event: Event): void {
    console.error('Image failed to load:', (event.target as HTMLImageElement).src);
  }
}
