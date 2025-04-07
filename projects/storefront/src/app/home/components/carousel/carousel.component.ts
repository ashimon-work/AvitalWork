import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { StoreContextService } from '../../../core/services/store-context.service';

export interface CarouselSlide {
  imageUrl: string;
  altText: string;
  linkUrl?: string; // Optional link for the slide
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
})
export class CarouselComponent implements OnInit, OnDestroy {
  slides: CarouselSlide[] = [];

  private apiService: ApiService;
  private storeContext: StoreContextService;

  constructor(apiService: ApiService, storeContext: StoreContextService) {
    console.log('CarouselComponent constructor called');
    this.apiService = apiService;
    this.storeContext = storeContext;
  }
  currentStoreSlug: string | null = null;
  currentSlideIndex = 0;
  private autoPlaySubscription: Subscription | null = null;

  private readonly autoPlayIntervalMs = 5000;

  // Remove ngOnChanges as slides are no longer an Input

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.currentStoreSlug = this.storeContext.getCurrentStoreSlug();
    this.fetchSlides();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  fetchSlides(): void {
    console.log('fetchSlides() called');
    this.apiService.getCarouselImages().subscribe({
      next: (fetchedSlides) => {
        console.log('Fetched slides:', fetchedSlides);
        console.log('Fetched slides length:', fetchedSlides.length);
        if (fetchedSlides && fetchedSlides.length > 0) {
          console.log('Fetched slides:', fetchedSlides);
          console.log('Fetched slides length:', fetchedSlides.length);
        } else {
          console.log('No slides fetched');
        }
        this.slides = fetchedSlides;
        this.currentSlideIndex = 0;
        if (this.slides?.length > 0) {
          this.startAutoPlay();
        } else {
          this.stopAutoPlay();
        }
      },
      error: (err) => {
        console.error('Error fetching carousel slides:', err);
        this.slides = [];
        this.stopAutoPlay();
      }
    });
  }
  startAutoPlay(): void {
    this.stopAutoPlay();
    if (this.slides.length > 1) {
      this.autoPlaySubscription = interval(this.autoPlayIntervalMs).subscribe(() => {
        this.nextSlide();
      });
    }
  }

  stopAutoPlay(): void {
    if (this.autoPlaySubscription) {
      this.autoPlaySubscription.unsubscribe();
      this.autoPlaySubscription = null;
    }
  }

  selectSlide(index: number): void {
    console.log('selectSlide() called with index:', index);
    this.currentSlideIndex = index;
    this.startAutoPlay();
  }

  prevSlide(): void {
    console.log('prevSlide called');
    console.log('slides length in prevSlide:', this.slides.length);
    console.log('Before prevSlide:', this.currentSlideIndex);
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
    console.log('After prevSlide:', this.currentSlideIndex);
  }

  nextSlide(): void {
    console.log('nextSlide called');
    console.log('slides length in nextSlide:', this.slides.length);
    console.log('Before nextSlide:', this.currentSlideIndex);
    if (this.currentSlideIndex === this.slides.length - 1) {
      console.log('At the end, going to the beginning');
    }
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    console.log('After nextSlide:', this.currentSlideIndex);
  }

  // Calculate the transform style for the slides wrapper
  get slidesTransform(): string {
    return `translateX(-${this.currentSlideIndex * 100}%)`;
  }

  trackByFn(index: number, slide: CarouselSlide): string {
    return slide.imageUrl; // Or some unique identifier for the slide
  }
}
