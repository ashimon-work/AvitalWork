import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { interval, Subscription } from 'rxjs';

interface CarouselSlide {
  imageUrl: string;
  altText: string;
  linkUrl?: string; // Optional link for the slide
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit, OnDestroy {
  // Mock slide data - replace with dynamic data later if needed
  slides: CarouselSlide[] = [
    { imageUrl: '/assets/images/carousel-1.jpg', altText: 'Promotion 1' },
    { imageUrl: '/assets/images/carousel-2.jpg', altText: 'Promotion 2' },
    { imageUrl: '/assets/images/carousel-3.jpg', altText: 'Promotion 3' },
  ];

  currentSlideIndex = 0;
  private autoPlaySubscription: Subscription | null = null;
  private readonly autoPlayIntervalMs = 5000; // 5 seconds as per plan

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay(); // Ensure no duplicate intervals
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
    this.currentSlideIndex = index;
    this.startAutoPlay(); // Restart timer on manual interaction
  }

  prevSlide(): void {
    const isFirstSlide = this.currentSlideIndex === 0;
    this.currentSlideIndex = isFirstSlide ? this.slides.length - 1 : this.currentSlideIndex - 1;
    this.startAutoPlay(); // Restart timer
  }

  nextSlide(): void {
    const isLastSlide = this.currentSlideIndex === this.slides.length - 1;
    this.currentSlideIndex = isLastSlide ? 0 : this.currentSlideIndex + 1;
    this.startAutoPlay(); // Restart timer
  }
}
