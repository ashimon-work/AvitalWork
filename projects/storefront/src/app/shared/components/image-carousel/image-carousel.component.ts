import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { T } from '@shared/i18n';
import { TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-image-carousel',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './image-carousel.component.html',
  styleUrl: './image-carousel.component.scss'
})
export class ImageCarouselComponent implements OnInit, OnDestroy {
  public tKeys = T;
  @Input() images: string[] = [];
  currentImageIndex: number = 0;
  ngOnInit(): void {
    // Ensure images array is not empty
    if (!this.images || this.images.length === 0) {
      console.warn('ImageCarouselComponent: No images provided.');
      // Optionally set a placeholder image or handle this case
      // this.images = ['/assets/images/placeholder.png'];
    }
  }

  ngOnDestroy(): void {
    // No automatic rotation to stop
  }

  nextImage(): void {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }
  }

  prevImage(): void {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    }
  }

  selectImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentImageIndex = index;
    }
  }
}