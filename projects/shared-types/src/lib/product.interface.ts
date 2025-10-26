// Represents a specific option combination for a variant
import { Category } from "@shared-types";

// e.g., { name: 'Color', value: 'Red' } or { name: 'Size', value: 'Large' }
export interface ProductVariantOption {
  name: string;
  value: string;
}

// Represents a specific purchasable variant of a product
export interface ProductVariant {
  id: string; // Unique identifier for this specific variant combination
  sku: string; // SKU specific to this variant
  options: ProductVariantOption[]; // The combination of options defining this variant
  price?: number; // Optional: Price specific to this variant, overrides base product price if present
  stockLevel: number; // Stock level for this specific variant
  imageUrl?: string; // Optional: Image specific to this variant
}

// Represents the base product, which may have multiple variants
export interface Product {
  id: string; // Unique identifier for the base product concept
  sku: string; // Base SKU for the product concept (may not be directly purchasable if variants exist)
  name: string;
  description: string;
  price: number; // Base price (can be overridden by variants)
  // imageUrl?: string; // Replaced by imageUrls
  imageUrls: string[]; // Array of image URLs. First image is typically the primary one.
  categories: Category[]; // IDs of categories it belongs to
  tags?: string[]; // e.g., 'New', 'Sale'
  stockLevel: number; // Base stock level (relevant if product is sold without variants or as a fallback)
  isActive: boolean;

  // Variant Information (Optional)
  options?: string[]; // Defines the types of options available, e.g., ['Color', 'Size']
  variants?: ProductVariant[]; // Array of specific variants available for purchase. If empty or undefined, the base product details (price, stock) are used.

  // Add timestamps (createdAt, updatedAt) later if needed
  // Consider adding fields for detailed specifications, dimensions, weight etc. later
}
