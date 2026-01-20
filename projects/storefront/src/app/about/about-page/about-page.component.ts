import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, AboutContent } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { CartService } from '../../core/services/cart.service';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';
import { T, TranslatePipe } from '@shared/i18n';
import { MaterialModule } from '../../shared/material.module';
import { FeaturedProductCardComponent } from '../../shared/components/featured-product-card/featured-product-card.component';
import { Product } from '@shared-types';

interface Testimonial {
  quote: string;
  author: string;
  date?: string;
  rating?: number;
}

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, FeaturedProductCardComponent],
  imports: [CommonModule, RouterModule, MaterialModule, FeaturedProductCardComponent, TranslatePipe],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent {
  public tKeys = T;
  aboutContent$!: Observable<AboutContent | null>;
  testimonials$!: Observable<Testimonial[]>;
  products$: Observable<Product[]>;
  currentStoreSlug$: Observable<string | null>;

  values = [
    {
      icon: '/assets/icons/lightbulb.svg',
      title: 'Thoughtful Design',
      description: 'Every piece is crafted to balance style and function—made to look good and work even better in your space.',
    },
    {
      icon: '/assets/icons/leaf.svg',
      title: 'Sustainable Materials',
      description: 'We use eco-friendly, responsibly sourced materials that are safe for your home and kind to the planet.',
    },
    {
      icon: '/assets/icons/diamond.svg',
      title: 'Built to Last',
      description: 'Durability is in the details—our products are made to stand up to everyday life and stay beautiful over time.',
    },
    {
      icon: '/assets/icons/footprints.svg',
      title: 'Simple Living, Elevated',
      description: 'From smart storage to cozy textures, our collection helps you create a home that feels calm, comfortable, and uniquely yours.',
    },
  ];



  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);
  private cartService = inject(CartService);

  constructor() {
    this.aboutContent$ = of({
      title: 'אודות החנות שלנו',
      body: 'ברוכים הבאים לחנות שלנו! אנו מחויבים לספק מוצרים באיכות גבוהה ושירות לקוחות מעולה.',
      imageUrl: undefined
    });
    this.testimonials$ = of([]);
    this.products$ = this.apiService.getFeaturedProducts().pipe(map(products => products.slice(0, 4)));
    this.currentStoreSlug$ = this.storeContext.currentStoreSlug$;
  }

  onAddToCart(event: any): void {
    // Check if event is a Product object or contains product data
    const product = event?.product || event;

    if (!product || !product.id) {
      console.error('Invalid product data received:', event);
      return;
    }

    this.cartService.addItem(product).subscribe({
      next: () => {
        // Show success message if needed
        console.log('Product added to cart');
      },
      error: (error: any) => {
        console.error('Error adding product to cart:', error);
      }
    });
  }
}
