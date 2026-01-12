import { CommonModule } from '@angular/common';
import { CarouselComponent } from '../components/carousel/carousel.component';
import { FeaturedCategoryCardComponent } from '../../shared/components/featured-category-card/featured-category-card.component';
import { FeaturedProductCardComponent } from '../../shared/components/featured-product-card/featured-product-card.component';
import { Component, inject } from '@angular/core';
import { startWith, tap, catchError, Observable, of } from 'rxjs';
import { T, TranslatePipe } from '@shared/i18n';
import { Category, Product } from '@shared-types';
import { ApiService } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { CarouselSlide } from '../components/carousel/carousel.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    CarouselComponent,
    FeaturedCategoryCardComponent,
    FeaturedProductCardComponent,
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

  constructor() {
    console.log('<<<<< HomepageComponent Constructor Start >>>>>'); // Add this very first line
    console.log('[HomepageComponent] Fetching featured categories...');
    this.featuredCategories$ = this.apiService.getFeaturedCategories().pipe(
      tap(categories => console.log('[HomepageComponent] Featured categories fetched:', categories)),
      catchError(error => {
        console.error('[HomepageComponent] Error fetching featured categories:', error);
        return of([]);
      })
    );

    this.featuredProducts$ = this.apiService.getFeaturedProducts();
    this.carouselSlides$ = this.apiService.getCarouselImages().pipe(startWith([]));
    
    // Initialize newsletter form
    this.newsletterForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  onAddToCart(event: any): void {
    // Check if event is a Product object or contains product data
    const product = event?.product || event;
    
    if (!product || !product.id) {
      console.error('Invalid product data received:', event);
      return;
    }

    this.cartService.addItem(product).subscribe({
      error: (error: any) => {
        console.error('Error adding product to cart:', error);
      }
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
        }
      });
    }
  }
}
