import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Product as IProduct } from '@shared-types';
import { ProductVariantDto } from './product-variant.dto';
import { CategoryEntity } from '../../categories/entities/category.entity'; // Assuming CategoryEntity is used directly in DTO for simplicity, or create CategoryDto

// Note: This DTO represents the structure returned by the API,
// which aligns closely with the shared Product interface but includes relations.
export class ProductDto implements IProduct {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsArray()
  @IsString({ each: true })
  imageUrls: string[];

  // Assuming categories are returned as an array of CategoryEntity or a simplified DTO
  @IsArray()
  // @ValidateNested({ each: true }) // Uncomment if using CategoryDto
  // @Type(() => CategoryDto) // Uncomment if using CategoryDto
  // For now, assuming array of CategoryEntity or simple objects
  categoryIds: string[]; // Or CategoryEntity[] or CategoryDto[]

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsNumber()
  @IsNotEmpty()
  stockLevel: number;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  options?: string[]; // e.g., ['Color', 'Size']

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  // Add timestamps if needed in the API response
  // @IsDate()
  // createdAt: Date;

  // @IsDate()
  // updatedAt: Date;
}