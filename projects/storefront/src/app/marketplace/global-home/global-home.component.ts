import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * GlobalHomeComponent
 *
 * This is the entry point for the Global Marketplace.
 * It serves as the landing page for the root path (/) and is NOT tied to any specific store.
 *
 * Future enhancements may include:
 * - Featured stores carousel
 * - Global product listings
 * - Store categories
 * - Search functionality across all stores
 */
@Component({
  selector: 'app-global-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './global-home.component.html',
  styleUrl: './global-home.component.scss',
})
export class GlobalHomeComponent {
  /**
   * Featured stores for the global marketplace.
   * This is placeholder data that will be replaced with API calls.
   */
  featuredStores = [
    { name: 'Awesome Gadgets', slug: 'awesome-gadgets', description: 'The latest tech gadgets and electronics' },
    { name: 'Fashion Forward', slug: 'fashion-forward', description: 'Trendy clothing and accessories' },
    { name: 'Home Essentials', slug: 'home-essentials', description: 'Everything you need for your home' },
  ];

  /**
   * Navigate to a specific store.
   * This method can be enhanced with analytics tracking or other logic.
   */
  navigateToStore(storeSlug: string): void {
    console.log(`[GlobalHomeComponent] Navigating to store: ${storeSlug}`);
  }
}
