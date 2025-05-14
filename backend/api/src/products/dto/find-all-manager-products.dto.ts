import { IsOptional, IsString, IsNumberString, IsIn, IsBooleanString } from 'class-validator';

export class FindAllManagerProductsDto {
  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  @IsIn(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest', 'oldest', 'stock-asc', 'stock-desc']) // Added manager-specific sort options
  sort?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  price_min?: string;

  @IsOptional()
  @IsNumberString()
  price_max?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}