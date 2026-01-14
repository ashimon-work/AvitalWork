import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListingComponent } from '../../shared/components/product-listing/product-listing.component';
import { RouterLink } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';
import { StoreContextService } from '../../core/services/store-context.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-all-products-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductListingComponent, TranslatePipe],
  templateUrl: './all-products-page.component.html',
  styleUrl: './all-products-page.component.scss',
})
export class AllProductsPageComponent {
  public tKeys = T;

  // Inject dependencies
  private route = inject(ActivatedRoute);
  private storeContext = inject(StoreContextService);

  // Convert Observables to signals for efficient template binding
  // Signals only trigger updates when actual values change, not just references
  readonly currentStoreSlug = toSignal(this.storeContext.currentStoreSlug$, {
    initialValue: null,
  });
  readonly queryParams = toSignal(
    this.route.queryParams.pipe(map((params) => ({ ...params }))),
    { initialValue: {} as Params }
  );
}
