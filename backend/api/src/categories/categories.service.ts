import { Injectable } from '@nestjs/common';
import { Category } from '@shared-types'; // Import the shared interface
import { v4 as uuidv4 } from 'uuid'; // For generating mock IDs

@Injectable()
export class CategoriesService {
  // Mock data for featured categories
  private featuredCategories: Category[] = [
    {
      id: uuidv4(),
      name: 'Electronics',
      imageUrl: '/assets/mock/categories/electronics.jpg',
      description: 'Gadgets and devices',
    },
    {
      id: uuidv4(),
      name: 'Apparel',
      imageUrl: '/assets/mock/categories/apparel.jpg',
      description: 'Clothing and fashion',
    },
    {
      id: uuidv4(),
      name: 'Home Goods',
      imageUrl: '/assets/mock/categories/homegoods.jpg',
      description: 'Items for your home',
    },
    {
      id: uuidv4(),
      name: 'Books',
      imageUrl: '/assets/mock/categories/books.jpg',
      description: 'Literature and reading materials',
    },
  ];

  async getFeaturedCategories(): Promise<Category[]> {
    // In a real scenario, this would fetch from a database
    // For now, return the mock data
    return this.featuredCategories;
  }
}
