export interface Product {
  id: string; // Or number, depending on DB choice
  sku: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string; // Optional main image URL
  categoryIds: string[]; // IDs of categories it belongs to
  tags?: string[]; // e.g., 'New', 'Sale'
  stockLevel: number;
  isActive: boolean;
  // Add variant details later if needed
  // Add timestamps (createdAt, updatedAt) later
}
