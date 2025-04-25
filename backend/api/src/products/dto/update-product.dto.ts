import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductVariantDto } from './product-variant.dto';
import { ProductVariantOptionDto } from './product-variant-option.dto';

// Note: Update DTO has all fields optional
export class UpdateProductDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsArray()
  @IsUUID('4', { each: true }) // Assuming category IDs are UUIDs
  @IsOptional() // Categories can be updated
  categoryIds?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsNumber()
  @IsOptional()
  stockLevel?: number; // Base stock level

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  options?: string[]; // e.g., ['Color', 'Size']

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  // storeId is typically not updated via this DTO
  // @IsString()
  // @IsUUID()
  // @IsOptional()
  // storeId?: string;
}