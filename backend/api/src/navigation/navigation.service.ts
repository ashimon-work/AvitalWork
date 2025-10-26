import { Injectable, Logger } from '@nestjs/common';
// Import CategoryService if needed later to fetch dynamic categories
// import { CategoriesService } from '../categories/categories.service';

export interface PopularLink {
  // Export the interface
  name: string;
  path: string; // Path relative to the store slug (e.g., 'shop', 'category/electronics')
}

@Injectable()
export class NavigationService {
  private readonly logger = new Logger(NavigationService.name);
  // Inject CategoriesService later if needed
  // constructor(private readonly categoriesService: CategoriesService) {}
  constructor() {}

  async getPopularLinks(storeSlug?: string): Promise<PopularLink[]> {
    this.logger.log(
      `Generating popular links for store: ${storeSlug || 'all'}`,
    );

    // TODO: Implement dynamic logic later (e.g., fetch top categories)
    // For now, return hardcoded examples

    const links: PopularLink[] = [
      { name: 'Homepage', path: '' }, // Path relative to store slug
      { name: 'Shop All', path: 'shop' }, // Example shop route
      // Add more links, potentially fetched dynamically
      // Example: Fetch top 2 categories
      // const topCategories = await this.categoriesService.getTopCategories(storeSlug, 2);
      // links.push(...topCategories.map(cat => ({ name: cat.name, path: `category/${cat.id}` })));
    ];

    // Example adding a specific category known to exist
    links.push({
      name: 'Featured Gadgets',
      path: 'category/d7a7f5e4-1b9e-4a8c-9c1f-8e5d7b3a2d1b',
    }); // Replace with actual ID if needed

    return links;
  }
}
