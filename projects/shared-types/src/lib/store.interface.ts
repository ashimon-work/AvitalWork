import { Product } from './product.interface';
import { Category } from './category.interface';
// Assuming CarouselItem might have its own interface if needed for frontend
// For now, we'll omit relations like products, categories, carouselItems
// from the shared interface unless specifically needed by consuming frontend components
// to keep it lean. They can be fetched via separate API calls if required.

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  // products?: Product[]; // Typically not included directly in every Store fetch for performance
  // categories?: Category[]; // Same as above
  // carouselItems?: any[]; // Define CarouselItem interface if needed
  createdAt?: Date | string;
  updatedAt?: Date | string;
}