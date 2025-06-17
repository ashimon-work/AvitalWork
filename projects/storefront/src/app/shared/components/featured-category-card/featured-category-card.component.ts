import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '@shared-types'; // Import Category type
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-featured-category-card',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule
  templateUrl: './featured-category-card.component.html',
  styleUrls: ['./featured-category-card.component.scss']
})
export class FeaturedCategoryCardComponent {
  @Input() category!: Category;
  @Input() storeSlug: string | null = null;

  get href(): string {
    if (this.storeSlug && this.category) {
      // Prefer category.slug if available, otherwise category.id
      // For now, assuming category.id as slug is not in the interface
      return `/${this.storeSlug}/category/${this.category.id}`;
    }
    // Fallback or default link if storeSlug or category is not available
    // This might lead to a generic categories page or an error state
    return '/categories';
  }

  get altText(): string {
    return this.category ? `Link to ${this.category.name}` : 'Category link';
  }
}