import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core'; // Import ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { StoreContextService } from '../../../core/services/store-context.service';
import { T, TranslatePipe } from '@shared/i18n';

export interface CarouselSlide {
  imageUrl: string;
  altText: string;
  linkUrl?: string; // Optional link for the slide
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
})
export class CarouselComponent implements OnInit, OnDestroy {
  public tKeys = T;
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
  currentSlideIndex = 1;
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
        this.currentSlideIndex = this.slides.length > 0 ? 1 : 0; // Start at the first real slide
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
    this.currentSlideIndex = index + 1; // Adjust index because 0 is the cloned last slide
    this.startAutoPlay(); // Restart timer on manual selection
  }

  prevSlide(): void {
    console.log('prevSlide called');
    console.log('slides length in prevSlide:', this.slides.length);
    console.log('Before prevSlide:', this.currentSlideIndex);
    if (this.transitioning || this.slides.length <= 1) return; // Prevent action during reset or if only one slide

    console.log('Before prevSlide:', this.currentSlideIndex);

    this.currentSlideIndex--; // Move to the previous index (could be the clone at 0)
    console.log('After decrement:', this.currentSlideIndex);

    // Check if we moved to the cloned last slide (index = 0)
    if (this.currentSlideIndex === 0) {
      console.log('Reached clone last, resetting...');
      // Wait for the transition to the clone to finish
      setTimeout(() => {
        this.transitioning = true; // Disable transition
        this.currentSlideIndex = this.slides.length; // Jump to the real last slide
        console.log('Jumped to index', this.slides.length);
        this.cdr.detectChanges(); // Ensure Angular detects the jump

        // Very short delay to allow Angular to apply the no-transition state
        // before re-enabling transitions
        setTimeout(() => {
          this.transitioning = false;
          console.log('Re-enabled transitions');
          this.cdr.detectChanges(); // Ensure Angular detects the re-enabled transition
        }, 10); // Small delay

      }, this.transitionDurationMs); // Wait for CSS transition
    } else {
       console.log('Moved to index:', this.currentSlideIndex);
    }
    // Don't restart autoplay here, let the interval handle it or manual interaction
  }

  nextSlide(): void {
    if (this.transitioning || this.slides.length <= 1) return; // Prevent action during reset or if only one slide

    console.log('nextSlide called');
    console.log('Before nextSlide:', this.currentSlideIndex);

    this.currentSlideIndex++; // Move to the next index (could be the appended clone)
    console.log('After increment:', this.currentSlideIndex);

    // Check if we moved to the cloned slide (index = slides.length)
    // Index of the appended clone is slides.length + 1 (0=clone_last, 1=first_real, ..., N=last_real, N+1=clone_first)
    if (this.currentSlideIndex === this.slides.length + 1) {
      console.log('Reached clone, resetting...');
      // Wait for the transition to the clone to finish
      setTimeout(() => {
        this.transitioning = true; // Disable transition
        this.currentSlideIndex = 1; // Jump to the real first slide (index 1)
        console.log('Jumped to index 1');
        this.cdr.detectChanges(); // Ensure Angular detects the jump

        // Very short delay to allow Angular to apply the no-transition state
        // before re-enabling transitions for the next user interaction/autoplay
        setTimeout(() => {
          this.transitioning = false;
          console.log('Re-enabled transitions');
          this.cdr.detectChanges(); // Ensure Angular detects the re-enabled transition
        }, 10); // Small delay like 10ms is usually enough

      }, this.transitionDurationMs); // Wait for CSS transition to complete
    } else {
       console.log('Moved to index:', this.currentSlideIndex);
    }
     // Don't restart autoplay here, let the interval handle it or manual interaction
  }

  // Calculate the transform style for the slides wrapper
  // Calculate the transform style for the slides wrapper
  get slidesTransform(): string {
    // Use currentSlideIndex which might point to the prepended (-1) or appended (N+1) clone temporarily
    return `translateX(-${this.currentSlideIndex * 100}%)`;
  }

  trackByFn(index: number, slide: CarouselSlide): string {
    return slide.imageUrl; // Or some unique identifier for the slide
  }
}
