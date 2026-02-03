import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of, switchMap } from 'rxjs';
import { T, TranslatePipe } from '@shared/i18n';
import { ApiService, AboutContent } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';

@Component({
  selector: 'app-return-policy-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './return-policy-page.component.html',
  styleUrl: './return-policy-page.component.scss'
})
export class ReturnPolicyPageComponent implements OnInit {
  public tKeys = T;
  returnContent$: Observable<AboutContent | null> = of(null);

  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);

  ngOnInit() {
    // For now, load general about content as fallback
    // TODO: Implement specific return policy endpoint
    this.returnContent$ = this.storeContext.currentStoreSlug$.pipe(
      switchMap(storeSlug => this.apiService.getStoreAboutContent(storeSlug))
    );
  }
}
