import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core'; // Import ChangeDetectorRef
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
  private cdr: ChangeDetectorRef; // Add cdr property

  constructor(
    apiService: ApiService,
    storeContext: StoreContextService,
    cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {
    console.log('CarouselComponent constructor called');
    this.apiService = apiService;
    this.storeContext = storeContext;
    this.cdr = cdr; // Assign injected cdr
    this.currentStoreSlug = this.storeContext.currentStoreSlug$;
  }

  currentStoreSlug: Observable<string | null>;
  currentSlideIndex = 0;
  transitioning = false; // Flag to disable transition during reset
  private autoPlaySubscription: Subscription | null = null;

  private readonly autoPlayIntervalMs = 5000;
  private readonly transitionDurationMs = 500; // Match CSS transition duration

  // Remove ngOnChanges as slides are no longer an Input

  ngOnInit(): void {
    console.log('ngOnInit called');
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
        this.cdr.detectChanges(); // Trigger change detection here
      },
      error: (err) => {
        console.error('Error fetching carousel slides:', err);
        this.slides = [];
        this.stopAutoPlay();
        this.cdr.detectChanges(); // Also trigger on error if state changes
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
    if (this.transitioning) return; // Prevent selection during reset
    this.currentSlideIndex = index;
    this.startAutoPlay(); // Restart timer on manual selection
  }

  prevSlide(): void {
    console.log('prevSlide called');
    console.log('slides length in prevSlide:', this.slides.length);
    console.log('Before prevSlide:', this.currentSlideIndex);
    if (this.transitioning) return; // Prevent action during reset
    // Basic prev logic - doesn't handle infinite backward yet
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
    console.log('After prevSlide:', this.currentSlideIndex);
    this.startAutoPlay(); // Restart timer
  }

  nextSlide(): void {
    if (this.transitioning || this.slides.length <= 1) return; // Prevent action during reset or if only one slide

    console.log('nextSlide called');
    console.log('Before nextSlide:', this.currentSlideIndex);

    this.currentSlideIndex++; // Move to the next index (could be the clone)
    console.log('After increment:', this.currentSlideIndex);

    // Check if we moved to the cloned slide (index = slides.length)
    if (this.currentSlideIndex === this.slides.length) {
      console.log('Reached clone, resetting...');
      // Wait for the transition to the clone to finish
      setTimeout(() => {
        this.transitioning = true; // Disable transition
        this.currentSlideIndex = 0; // Jump to the real first slide
        console.log('Jumped to index 0');

        // Very short delay to allow Angular to apply the no-transition state
        // before re-enabling transitions for the next user interaction/autoplay
        setTimeout(() => {
          this.transitioning = false;
          console.log('Re-enabled transitions');
        }, 10); // Small delay like 10ms is usually enough

      }, this.transitionDurationMs); // Wait for CSS transition to complete
    } else {
       console.log('Moved to index:', this.currentSlideIndex);
    }
     // Don't restart autoplay here, let the interval handle it
  }

  // Calculate the transform style for the slides wrapper
  // Calculate the transform style for the slides wrapper
  get slidesTransform(): string {
    // Use currentSlideIndex which might point to the clone temporarily
    return `translateX(-${this.currentSlideIndex * 100}%)`;
  }

  trackByFn(index: number, slide: CarouselSlide): string {
    return slide.imageUrl; // Or some unique identifier for the slide
  }
}
