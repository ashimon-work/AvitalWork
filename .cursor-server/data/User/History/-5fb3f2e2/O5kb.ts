import { CommonModule } from '@angular/common';
import { CarouselComponent } from '../components/carousel/carousel.component';
import { FeaturedCategoryCardComponent } from '../../shared/components/featured-category-card/featured-category-card.component';
import { FeaturedProductCardComponent } from '../../shared/components/featured-product-card/featured-product-card.component';
import { Component, inject } from '@angular/core';
import { startWith, tap, catchError, Observable, of, map } from 'rxjs';
import { T, TranslatePipe } from '@shared/i18n';
import { Category, Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { CarouselSlide } from '../components/carousel/carousel.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { MaterialModule } from '../../shared/material.module';
import { CategoryNavigationComponent } from '../../shared/components/category-navigation/category-navigation.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    CarouselComponent,
    FeaturedCategoryCardComponent,
    FeaturedProductCardComponent,
    CategoryNavigationComponent,
    TranslatePipe,
    ReactiveFormsModule,
    MaterialModule,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  public tKeys = T;

  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);
  private formBuilder = inject(FormBuilder);
  private cartService = inject(CartService);
  
  featuredCategories$: Observable<Category[]>;
  featuredProducts$: Observable<Product[]>;
  currentStoreSlug$: Observable<string | null> = this.storeContext.currentStoreSlug$;
  carouselSlides$: Observable<CarouselSlide[]>;
  
  newsletterForm: FormGroup;
  isSubmittingNewsletter = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  successMessage = '';
  errorMessage = '';
  selectedCategoryId: string | null = null;

  constructor() {
    console.log('<<<<< HomepageComponent Constructor Start >>>>>');
    // Fetch store categories
    this.categories$ = this.apiService.getStoreCategories().pipe(
      catchError((error) => {
        console.error(
          '[HomepageComponent] Error fetching store categories:',
          error
        );
        return of([]);
      })
    );
    console.log('[HomepageComponent] Fetching featured categories...');
    this.featuredCategories$ = this.apiService.getFeaturedCategories().pipe(
      tap((categories) =>
        console.log(
          '[HomepageComponent] Featured categories fetched:',
          categories
        )
      ),
      catchError((error) => {
        console.error(
          '[HomepageComponent] Error fetching featured categories:',
          error
        );
        return of([]);
      })
    );

    this.featuredProducts$ = this.apiService.getFeaturedProducts();
    this.carouselSlides$ = this.apiService
      .getCarouselImages()
      .pipe(startWith([]));

    // Initialize newsletter form
    this.newsletterForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  onCategorySelect(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
    // This code handles dynamic filtering of products on the home page. When a user selects a category from the navigation,
    // it retrieves specific products from that category. When the user clears the filter, it returns to showing all featured products.
    if (categoryId) {
      this.featuredProducts$ = this.apiService
        .getProducts({ category_id: categoryId })
        .pipe(map((response) => response?.products || []));
    } else {
      this.featuredProducts$ = this.apiService.getFeaturedProducts();
    }
  }

  onClearFilter(): void {
    this.selectedCategoryId = null;
    // Re-fetch featured products without category filter
    this.featuredProducts$ = this.apiService.getFeaturedProducts();
  }

  onAddToCart(event: any): void {
    // Check if event is a Product object or contains product data
    const product = event?.product || event;

    if (!product || !product.id) {
      console.error('Invalid product data received:', event);
      this.showErrorMessage = true;
      this.errorMessage = 'Invalid product data';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
      return;
    }

    this.cartService.addItem(product).subscribe({
      next: () => {
        // Show success message
        this.showSuccessMessage = true;
        this.successMessage = 'Product added to cart';
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error: any) => {
        console.error('Error adding product to cart:', error);
        // Show error message
        this.showErrorMessage = true;
        this.errorMessage = 'Error adding product to cart';
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 3000);
      },
    });
  }

  onNewsletterSubmit(): void {
    if (this.newsletterForm.valid) {
      this.isSubmittingNewsletter = true;
      const email = this.newsletterForm.get('email')?.value;

      this.apiService.subscribeNewsletter(email).subscribe({
        next: () => {
          this.showSuccessMessage = true;
          this.successMessage = 'Successfully subscribed to newsletter!';
          this.newsletterForm.reset();
          this.isSubmittingNewsletter = false;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        },
        error: (error: any) => {
          console.error('Error subscribing to newsletter:', error);
          this.showErrorMessage = true;
          this.errorMessage = 'Error subscribing to newsletter';
          this.isSubmittingNewsletter = false;
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 3000);
        },
      });
    }
  }
}
