import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of, switchMap } from 'rxjs';
import { T, TranslatePipe } from '@shared/i18n';
import { ApiService, FaqItem } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-page.component.html',
  styleUrl: './faq-page.component.scss'
})
export class FaqPageComponent implements OnInit {
  public tKeys = T;
  faqs$: Observable<FaqItem[]> = of([]);

  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);

  ngOnInit() {
    this.faqs$ = this.storeContext.currentStoreSlug$.pipe(
      switchMap(storeSlug => this.apiService.getFaqs(storeSlug))
    );
  }
}
