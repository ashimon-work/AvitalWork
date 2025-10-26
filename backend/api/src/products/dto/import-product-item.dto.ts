import { IsString, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportProductItemDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString() // Price will be a string from CSV, needs parsing
  price: string;

  @IsOptional()
  @IsString() // Image URLs might be a comma-separated string
  imageUrls?: string;

  @IsString() // Category IDs might be a comma-separated string
  categoryIds: string;

  @IsOptional()
  @IsString() // Tags might be a comma-separated string
  tags?: string;

  @IsString() // Stock level will be a string from CSV, needs parsing
  stockLevel: string;

  @IsOptional()
  @IsString() // isActive might be 'true' or 'false' string
  isActive?: string;

  @IsOptional()
  @IsString() // Options might be a JSON string or comma-separated
  options?: string;

  @IsOptional()
  @IsString() // Variants might be a JSON string
  variants?: string;
}
