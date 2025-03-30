import { Injectable } from '@nestjs/common';
import { Product } from '@shared-types'; // Import the shared interface
import { v4 as uuidv4 } from 'uuid'; // For generating mock IDs

@Injectable()
export class ProductsService {
  // Mock data for featured products
  private featuredProducts: Product[] = [
    {
      id: uuidv4(),
      sku: 'ELEC-001',
      name: 'Wireless Noise-Cancelling Headphones',
      description: 'Experience immersive sound with these premium headphones.',
      price: 199.99,
      imageUrl: '/assets/mock/products/headphones.jpg',
      categoryIds: ['electronics-uuid'], // Replace with actual category ID if known
      tags: ['New', 'Featured'],
      stockLevel: 50,
      isActive: true,
    },
    {
      id: uuidv4(),
      sku: 'APPA-001',
      name: 'Classic Cotton T-Shirt',
      description: 'A comfortable and stylish everyday essential.',
      price: 24.99,
      imageUrl: '/assets/mock/products/tshirt.jpg',
      categoryIds: ['apparel-uuid'],
      tags: ['Best Seller'],
      stockLevel: 120,
      isActive: true,
    },
    {
      id: uuidv4(),
      sku: 'HOME-001',
      name: 'Ceramic Coffee Mug',
      description: 'Start your day right with this durable mug.',
      price: 12.5,
      imageUrl: '/assets/mock/products/mug.jpg',
      categoryIds: ['homegoods-uuid'],
      stockLevel: 80,
      isActive: true,
    },
    {
      id: uuidv4(),
      sku: 'BOOK-001',
      name: 'The Mystery Novel',
      description: 'A thrilling page-turner you won\'t want to put down.',
      price: 15.99,
      imageUrl: '/assets/mock/products/book.jpg',
      categoryIds: ['books-uuid'],
      tags: ['Featured'],
      stockLevel: 30,
      isActive: true,
    },
    {
      id: uuidv4(),
      sku: 'ELEC-002',
      name: 'Smartwatch Series 8',
      description: 'Stay connected and track your fitness.',
      price: 349.0,
      imageUrl: '/assets/mock/products/smartwatch.jpg',
      categoryIds: ['electronics-uuid'],
      tags: ['New', 'Featured'],
      stockLevel: 25,
      isActive: true,
    },
    {
      id: uuidv4(),
      sku: 'APPA-002',
      name: 'Denim Jeans',
      description: 'Classic fit denim jeans for any occasion.',
      price: 59.99,
      imageUrl: '/assets/mock/products/jeans.jpg',
      categoryIds: ['apparel-uuid'],
      stockLevel: 65,
      isActive: true,
    },
  ];

  async getFeaturedProducts(): Promise<Product[]> {
    // In a real scenario, this would fetch from a database based on criteria
    // For now, return the mock data
    return this.featuredProducts;
  }
}
