import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { Category } from '@shared-types';
import { ApiService } from '../../../core/services/api.service';
import { StoreContextService } from '../../../core/services/store-context.service';
import { CategoryDropdownService } from '../../../core/services/category-dropdown.service';

@Component({
  selector: 'app-category-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-navigation.component.html',
  styleUrls: ['./category-navigation.component.scss'],
})
export class CategoryNavigationComponent implements OnInit, OnDestroy {
  isOpen = false;
  currentCategoryId?: string;

  categories$!: Observable<Category[]>;
  categories: Category[] = [];
  storeSlug: string | null = null;

  private destroy$ = new Subject<void>();
  private apiService = inject(ApiService);
  private storeContext = inject(StoreContextService);
  private router = inject(Router);
  private categoryDropdownService = inject(CategoryDropdownService);

  ngOnInit(): void {
    this.categories$ = this.storeContext.currentStoreSlug$.pipe(
      switchMap((slug) => {
        this.storeSlug = slug;
        return slug ? this.apiService.getStoreCategories(slug) : of([]);
      }),
      takeUntil(this.destroy$)
    );

    this.categories$.subscribe((categories) => {
      this.categories = categories;
    });

    // Subscribe to dropdown state from service
    this.categoryDropdownService.dropdownState.pipe(takeUntil(this.destroy$)).subscribe((isOpen) => {
      this.isOpen = isOpen;
      if (isOpen) {
        this.disableBodyScroll();
      } else {
        this.enableBodyScroll();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Ensure body scroll is enabled when component is destroyed
    this.enableBodyScroll();
  }

  // Handle Esc key to close dropdown
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.onClose();
    }
  }

  // Handle click outside to close dropdown
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdownElement = document.querySelector('.category-navigation');
    
    if (this.isOpen && dropdownElement && !dropdownElement.contains(target)) {
      this.onClose();
    }
  }

  // Featured categories for the images (first 2 categories with images)
  get featuredCategories(): Category[] {
    return this.categories.filter((cat) => cat.imageUrl).slice(0, 2);
  }

  generateCategoryLink(categoryId: string): string[] {
    if (this.storeSlug) {
      return ['/', this.storeSlug, 'category', categoryId];
    }
    return ['/category', categoryId];
  }

  generateAllProductsLink(): string[] {
    if (this.storeSlug) {
      return ['/', this.storeSlug, 'products'];
    }
    return ['/products'];
  }

  onClose(): void {
    this.categoryDropdownService.close();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    img.onerror = null;
  }

  private disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }

  private enableBodyScroll(): void {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }
}
