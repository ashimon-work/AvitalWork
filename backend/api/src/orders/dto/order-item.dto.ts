import { ProductEntity } from '../../products/entities/product.entity'; // Assuming Product DTO is not needed here, just entity

export class OrderItemDto {
  id: string;
  productId: string; // Keep product ID
  productName: string; // Snapshot name
  quantity: number;
  pricePerUnit: number;
  variantDetails?: string; // Changed from Record<string, any>
  // Maybe add product image URL if needed
  product?: Partial<ProductEntity>; // Include partial product details like image if needed
}