import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { ProductDto } from '../../products/dto/product.dto';

export class CartItemDto {
  @IsUUID()
  id: string;

  @IsNumber()
  quantity: number;

  @ValidateNested()
  @Type(() => ProductDto)
  product: ProductDto;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
} 