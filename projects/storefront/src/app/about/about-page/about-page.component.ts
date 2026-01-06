import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { ApiService, AboutContent } from '../../core/services/api.service';
import { StoreContextService } from '../../core/services/store-context.service';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

interface Testimonial {
  quote: string;
  author: string;
  date?: string;
  rating?: number;
}

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslatePipe],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent implements OnInit {
  public tKeys = T;
  aboutContent$!: Observable<AboutContent | null>;
  testimonials$!: Observable<Testimonial[]>;

  constructor(
    private apiService: ApiService,
    private storeContext: StoreContextService
  ) {}

  ngOnInit() {
    // Dummy data for now
    this.aboutContent$ = of({
      title: 'אודות החנות שלנו',
      body: 'ברוכים הבאים לחנות שלנו! אנו מחויבים לספק מוצרים באיכות גבוהה ושירות לקוחות מעולה.',
      imageUrl: undefined
    });
    this.testimonials$ = of([]);
  }
}
