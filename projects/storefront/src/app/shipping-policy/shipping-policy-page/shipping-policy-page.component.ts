import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of, switchMap } from 'rxjs';
import { T, TranslatePipe } from '@shared/i18n';
import { ApiService, AboutContent } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';

@Component({
  selector: 'app-shipping-policy-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipping-policy-page.component.html',
  styleUrl: './shipping-policy-page.component.scss'
})
export class ShippingPolicyPageComponent implements OnInit {
  public tKeys = T;
  shippingContent$: Observable<AboutContent | null> = of(null);

  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);

  ngOnInit() {
    // For now, load general about content as fallback
    // TODO: Implement specific shipping policy endpoint
    this.shippingContent$ = this.storeContext.currentStoreSlug$.pipe(
      switchMap(storeSlug => this.apiService.getStoreAboutContent(storeSlug))
    );
  }
}
