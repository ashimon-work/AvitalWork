import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '@shared-types'; // Import Category type
import { RouterModule } from '@angular/router'; // Import RouterModule
import { Observable, switchMap, of, Subject, fromEvent } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { StoreContextService } from '../../../core/services/store-context.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-category-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule], // Removed FeaturedProductCardComponent since we're not using it anymore
  templateUrl: './category-navigation.component.html',
  styleUrls: ['./category-navigation.component.scss'],
})
export class CategoryNavigationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public categories$!: Observable<Category[]>;
  public categories: Category[] = [];
  public categoryCount = 0;
  public showArrows = false;
  public showProgressBar = false;
  public isCentered = true; // true for ≤9 categories, false for >9 categories

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  canScrollLeft = false;
  canScrollRight = false;
  scrollProgress = 0;

  private destroy$ = new Subject<void>();
  private scrollListenerSetup = false;

  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.categories$ = this.storeContext.currentStoreSlug$.pipe(
      switchMap((storeSlug) => {
        if (storeSlug) {
          return this.apiService.getStoreCategories(storeSlug);
        } else {
          return of([]);
        }
      })
    );

    // Subscribe to categories to update count and visibility
    this.categories$.pipe(takeUntil(this.destroy$)).subscribe((categories) => {
      console.log(`[CategoryNavigationComponent] Received ${categories.length} categories:`, categories);
      
      this.categories = categories;
      this.categoryCount = categories.length;
      
      // Show arrows and progress bar only if more than 9 categories
      this.showArrows = this.categoryCount > 9;
      this.showProgressBar = this.categoryCount > 9;
      // isCentered controls whether centered-content class is applied
      // When false, scrolling is enabled (full-width mode)
      this.isCentered = this.categoryCount <= 9;

      console.log(`[CategoryNavigationComponent] Category count: ${this.categoryCount}, Show arrows: ${this.showArrows}, Is centered: ${this.isCentered}`);

      // Force change detection to update the view
      this.cdr.detectChanges();

      // Reset scroll position to left when categories change (if scrolling is enabled)
      if (this.showArrows && this.scrollContainer?.nativeElement) {
        setTimeout(() => {
          this.scrollContainer.nativeElement.scrollLeft = 0;
          this.updateScrollState();
        }, 100);
      }

      // Re-setup scroll listener if needed (in case categories loaded after ngAfterViewInit)
      this.setupScrollListener();
    });
  }

  /**
   * Handle category click to navigate to category page
   */
  onCategoryClick(category: Category): void {
    this.storeContext.currentStoreSlug$.subscribe((storeSlug) => {
      if (storeSlug) {
        this.router.navigate([`/${storeSlug}/category`, category.id]);
      } else {
        console.warn(
          '[CategoryNavigationComponent] No store slug available for navigation'
        );
      }
    });
  }

  /**
   * Track by function for ngFor to improve performance
   */
  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }

  ngAfterViewInit() {
    // Set up scroll tracking after view initialization
    this.setupScrollListener();
  }

  private setupScrollListener(): void {
    // Use setTimeout to ensure the view is fully rendered
    setTimeout(() => {
      if (this.scrollContainer?.nativeElement) {
        const container = this.scrollContainer.nativeElement;
        
        // Set up scroll event listener (only if not already set up)
        if (!this.scrollListenerSetup) {
          fromEvent(container, 'scroll')
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.updateScrollState();
            });
          
          // Also listen for scrollend event if available (for smooth scrolling)
          if ('onscrollend' in container) {
            fromEvent(container, 'scrollend')
              .pipe(takeUntil(this.destroy$))
              .subscribe(() => {
                this.updateScrollState();
              });
          }
          
          this.scrollListenerSetup = true;
        }
        
        // Always update scroll state when called (even if listener already set up)
        this.updateScrollState();
      }
    }, 200);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scroll(direction: 'left' | 'right'): void {
    if (!this.scrollContainer || !this.showArrows) return;

    const container = this.scrollContainer.nativeElement;
    const scrollAmount = 200; // Adjust scroll amount as needed

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }

    // Update scroll state multiple times to catch the final position after smooth scrolling
    // This ensures the arrow states update correctly
    setTimeout(() => {
      this.updateScrollState();
    }, 50);
    setTimeout(() => {
      this.updateScrollState();
    }, 200);
    setTimeout(() => {
      this.updateScrollState();
    }, 500);
  }

  updateScrollState(): void {
    if (!this.scrollContainer || !this.showArrows) {
      this.canScrollLeft = false;
      this.canScrollRight = false;
      this.scrollProgress = 0;
      return;
    }

    const container = this.scrollContainer.nativeElement;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    // Use a small tolerance (1px) to account for rounding errors
    this.canScrollLeft = scrollLeft > 1;
    this.canScrollRight = scrollLeft < maxScroll - 1;

    // Update scroll progress
    this.scrollProgress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;

    console.log(`[CategoryNavigationComponent] Scroll state - scrollLeft: ${scrollLeft}, scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, maxScroll: ${maxScroll}, canScrollLeft: ${this.canScrollLeft}, canScrollRight: ${this.canScrollRight}`);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-category.jpg';
  }
}
