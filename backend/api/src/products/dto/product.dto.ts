import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Expose, Transform } from 'class-transformer';
import { Product as IProduct } from '@shared-types';
import { ProductVariantDto } from './product-variant.dto';
import { CategoryDto } from '../../categories/dto/category.dto';
import { StoreDto } from '../../stores/dto/store.dto';

// Note: This DTO represents the structure returned by the API,
// which aligns closely with the shared Product interface but includes relations.
export class ProductDto implements IProduct {
  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  sku: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Expose()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  price: number;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  imageUrls: string[];

  @Expose()
  @ValidateNested()
  @Type(() => StoreDto)
  store: StoreDto;

  // Assuming categories are returned as an array of CategoryEntity or a simplified DTO
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];

  @Expose()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  stockLevel: number;

  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  isFeaturedInMarketplace: boolean;

  @Expose()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  options?: string[]; // e.g., ['Color', 'Size']

  @Expose()
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
