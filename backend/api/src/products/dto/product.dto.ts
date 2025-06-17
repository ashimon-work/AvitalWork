import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Product as IProduct } from '@shared-types';
import { ProductVariantDto } from './product-variant.dto';
import { CategoryDto } from '../../categories/dto/category.dto';

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
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];

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

  @IsBoolean()
  @IsNotEmpty()
  isFeaturedInMarketplace: boolean;

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