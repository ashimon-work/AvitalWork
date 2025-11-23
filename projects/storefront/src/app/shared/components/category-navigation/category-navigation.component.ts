import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '@shared-types';
import { Router, RouterModule } from '@angular/router';
import {
  debounceTime,
  Observable,
  switchMap,
  of,
  Subject,
  fromEvent,
  take,
  takeUntil,
} from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { StoreContextService } from '../../../core/services/store-context.service';

const SCROLL_THRESHOLD = 9;

@Component({
  selector: 'app-category-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  public enableScrolling = false;

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @Input() currentCategoryId?: string; // Add input for current category ID

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
      this.categories = categories;
      this.categoryCount = categories.length;

      // Show arrows and progress bar only if more than 9 categories
      this.showArrows = this.categoryCount >= SCROLL_THRESHOLD;
      this.showProgressBar = this.categoryCount >= SCROLL_THRESHOLD;

      // Check if content overflows the container (will be determined after view is rendered)
      // For now, set to false and check after view is rendered
      this.enableScrolling = false;

      // isCentered controls whether centered-content class is applied
      // When false, scrolling is enabled (full-width mode)
      this.isCentered = this.categoryCount < SCROLL_THRESHOLD;

      // Force change detection to update the view
      this.cdr.detectChanges();

      // Check for content overflow after view is rendered
      setTimeout(() => {
        this.checkContentOverflow();

        // Reset scroll position to left when categories change (if scrolling is enabled)
        if (this.enableScrolling && this.scrollContainer?.nativeElement) {
          const container = this.scrollContainer.nativeElement;
          container.scrollLeft = 0;
          this.updateScrollState();
        }
      }, 100);

      // Re-setup scroll listener if needed (in case categories loaded after ngAfterViewInit)
      this.setupScrollListener();
    });
  }

  /**
   * Handle category click to navigate to category page
   */
  onCategoryClick(category: Category): void {
    this.storeContext.currentStoreSlug$.pipe(take(1)).subscribe((storeSlug) => {
      if (storeSlug) {
        this.router.navigate([`/${storeSlug}/category`, category.id]);
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
            .pipe(
              takeUntil(this.destroy$),
              debounceTime(100) //Waits 100ms after the user stops scrolling
            )
            .subscribe(() => {
              this.updateScrollState();
            });

          fromEvent(window, 'resize')
            .pipe(takeUntil(this.destroy$), debounceTime(200))
            .subscribe(() => {
              this.checkContentOverflow();
            });

          this.scrollListenerSetup = true;
        }

        this.updateScrollState();
      }
    }, 200);
  }

  /**
   * Check if content overflows the container and enable scrolling accordingly
   */
  private checkContentOverflow(): void {
    if (!this.scrollContainer?.nativeElement) return;

    const container = this.scrollContainer.nativeElement;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    // Enable scrolling if content overflows the container
    const hasOverflow = scrollWidth > clientWidth;

    // Only update if the scrolling state needs to change
    if (this.enableScrolling !== hasOverflow) {
      this.enableScrolling = hasOverflow;

      // Force change detection to update the view
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scroll(direction: 'left' | 'right'): void {
    if (!this.scrollContainer || !this.showArrows) return;

    const container = this.scrollContainer.nativeElement;
    const scrollAmount = 200;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  updateScrollState(): void {
    if (!this.scrollContainer) return;

    const container = this.scrollContainer.nativeElement;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    this.canScrollLeft = scrollLeft > 1;
    this.canScrollRight = scrollLeft < maxScroll - 1;

    // Update scroll progress
    this.scrollProgress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Use a data URI for a simple placeholder instead of a missing file
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    // Prevent infinite loop if data URI also fails
    img.onerror = null;
  }
}
