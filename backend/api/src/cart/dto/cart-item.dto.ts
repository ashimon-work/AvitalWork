import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { ProductDto } from '../../products/dto/product.dto';
import { Expose } from 'class-transformer';

export class CartItemDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsNumber()
  quantity: number;

  @Expose()
  @ValidateNested()
  @Type(() => ProductDto)
  product: ProductDto;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}
