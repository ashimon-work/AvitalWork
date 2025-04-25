import { IsString, IsNotEmpty } from 'class-validator';
import { ProductVariantOption as IProductVariantOption } from '@shared-types';

export class ProductVariantOptionDto implements IProductVariantOption {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}