import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductVariantDto } from './product-variant.dto';
import { ProductVariantOptionDto } from './product-variant-option.dto';

export class CreateProductDto {
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
  @IsOptional() // Image URLs might be added after creation
  imageUrls?: string[];

  @IsArray()
  @IsUUID('4', { each: true }) // Assuming category IDs are UUIDs
  @IsNotEmpty({ each: true })
  categoryIds: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsNumber()
  @IsNotEmpty()
  stockLevel: number; // Base stock level

  @IsBoolean()
  @IsOptional() // Default to true if not provided
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

}