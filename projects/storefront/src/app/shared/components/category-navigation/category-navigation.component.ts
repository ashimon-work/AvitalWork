import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subject, fromEvent, of } from 'rxjs';
import { debounceTime, switchMap, take, takeUntil } from 'rxjs/operators';

import { Category } from '@shared-types';
import { ApiService } from '../../../core/services/api.service';
import { StoreContextService } from '../../../core/services/store-context.service';

@Component({
  selector: 'app-category-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-navigation.component.html',
  styleUrls: ['./category-navigation.component.scss'],
})
export class CategoryNavigationComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;
  @ViewChild('navList') navList!: ElementRef<HTMLElement>;
  @Input() currentCategoryId?: string;

  categories$!: Observable<Category[]>;
  categories: Category[] = [];

  hasOverflow = false;
  canScrollLeft = false;
  canScrollRight = false;
  scrollProgress = 0;

  private destroy$ = new Subject<void>();
  private listenersInitialized = false;

  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);
  private router = inject(Router);

  /* ----------------------------------
   * Lifecycle
   * ---------------------------------- */

  ngOnInit(): void {
    this.categories$ = this.storeContext.currentStoreSlug$.pipe(
      switchMap((slug) =>
        slug ? this.apiService.getStoreCategories(slug) : of([])
      )
    );

    this.categories$.pipe(takeUntil(this.destroy$)).subscribe((categories) => {
      this.categories = categories;
      this.resetScroll();
      this.updateAfterRender();
    });
  }

  ngAfterViewInit(): void {
    this.initScrollListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentCategoryId']?.currentValue) {
      this.scrollToActiveCategory();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ----------------------------------
   * Navigation
   * ---------------------------------- */

  onCategoryClick(category: Category): void {
    this.storeContext.currentStoreSlug$.pipe(take(1)).subscribe((slug) => {
      if (slug) {
        this.router.navigate([`/${slug}/category`, category.id]);
      }
    });
  }

  trackByCategoryId(_: number, category: Category): string {
    return category.id;
  }

  /* ----------------------------------
   * Scroll handling
   * ---------------------------------- */

  scroll(direction: 'left' | 'right'): void {
    if (!this.scrollContainer || !this.hasOverflow) return;

    const offset = direction === 'left' ? -200 : 200;
    this.scrollContainer.nativeElement.scrollBy({
      left: offset,
      behavior: 'smooth',
    });

    this.defer(() => this.updateScrollMetrics());
  }

  private initScrollListeners(): void {
    if (this.listenersInitialized || !this.scrollContainer) return;

    const container = this.scrollContainer.nativeElement;

    fromEvent(container, 'scroll')
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe(() => this.updateScrollMetrics());

    fromEvent(window, 'resize')
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => this.updateAfterRender());

    this.listenersInitialized = true;
  }

  private updateAfterRender(): void {
    this.defer(() => {
      this.updateOverflowState();
      this.updateScrollMetrics();
    });
  }

  private updateOverflowState(): void {
    if (!this.scrollContainer) return;

    const { scrollWidth, clientWidth } = this.scrollContainer.nativeElement;

    this.hasOverflow = scrollWidth > clientWidth + 1;

    if (this.hasOverflow) {
      this.applyScrollPadding();
    }
  }

  private updateScrollMetrics(): void {
    if (!this.scrollContainer || !this.hasOverflow) return;

    const el = this.scrollContainer.nativeElement;
    const maxScroll = el.scrollWidth - el.clientWidth;

    this.canScrollLeft = el.scrollLeft > 1;
    this.canScrollRight = el.scrollLeft < maxScroll - 1;
    this.scrollProgress =
      maxScroll > 0 ? Math.min((el.scrollLeft / maxScroll) * 100, 100) : 0;
  }

  private resetScroll(): void {
    if (!this.scrollContainer) return;
    this.scrollContainer.nativeElement.scrollLeft = 0;
  }

  private scrollToActiveCategory(): void {
    this.defer(() => {
      if (!this.navList || !this.scrollContainer) return;

      const links =
        this.navList.nativeElement.querySelectorAll<HTMLElement>('.nav-link');

      const activeIndex = Array.from(links).findIndex((el) =>
        el.classList.contains('active')
      );

      if (activeIndex === -1) return;

      if (activeIndex === links.length - 1) {
        const container = this.scrollContainer.nativeElement;
        container.scrollTo({
          left: container.scrollWidth - container.clientWidth,
          behavior: 'smooth',
        });
      } else {
        links[activeIndex].scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }

      this.defer(() => this.updateScrollMetrics(), 600);
    }, 500);
  }

  /* ----------------------------------
   * Utils
   * ---------------------------------- */

  private applyScrollPadding(): void {
    this.scrollContainer.nativeElement.style.scrollPaddingInline = '3.5rem';
  }

  private defer(fn: () => void, delay = 300): void {
    setTimeout(fn, delay);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    img.onerror = null;
  }
}
