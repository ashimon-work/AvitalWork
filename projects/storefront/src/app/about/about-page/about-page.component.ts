import { Component, OnInit, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AsyncPipe, NgIf, NgFor, DatePipe } from '@angular/common';
import { ApiService, AboutContent, Testimonial } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, DatePipe, TranslatePipe],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent implements OnInit {
  public tKeys = T;
  private apiService = inject(ApiService);
  private storeContextService = inject(StoreContextService);

  aboutContent$: Observable<AboutContent | null> = of(null);
  testimonials$: Observable<Testimonial[]> = of([]);

  ngOnInit(): void {
    this.aboutContent$ = this.storeContextService.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) return of(null);
        return this.apiService.getStoreAboutContent(storeSlug);
      })
    );

    this.testimonials$ = this.storeContextService.currentStoreSlug$.pipe(
      take(1),
      switchMap(storeSlug => {
        if (!storeSlug) return of([]);
        return this.apiService.getStoreTestimonials(storeSlug);
      })
    );
  }
}
