import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@shared-types';
import { ProductListingComponent } from '../../shared/components/product-listing/product-listing.component';
import { RouterLink } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';
import { StoreContextService } from '../../core/services/store-context.service';
import { Observable, map } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-all-products-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProductListingComponent,
    TranslatePipe
  ],
  templateUrl: './all-products-page.component.html',
  styleUrl: './all-products-page.component.scss'
})
export class AllProductsPageComponent implements OnInit {
  public tKeys = T;
  currentStoreSlug$: Observable<string | null>;
  queryParams$: Observable<Params>;

  constructor(
    private route: ActivatedRoute,
    private storeContext: StoreContextService
  ) {
    this.currentStoreSlug$ = this.storeContext.currentStoreSlug$;
    this.queryParams$ = this.route.queryParams.pipe(
      map(params => ({ ...params }))
    );
  }

  ngOnInit(): void {
    // Component initialization
  }

  onAddToCart(product: Product): void {
    // This is handled by the ProductListingComponent
    // This method is kept for potential future use
  }
}
