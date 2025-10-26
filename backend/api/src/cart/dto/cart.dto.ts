import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CartItemDto } from './cart-item.dto';
import { StoreDto } from '../../stores/dto/store.dto';
import { Expose } from 'class-transformer';

export class CartDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  guestCartId?: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  userId?: string;

  @Expose()
  @ValidateNested()
  @Type(() => StoreDto)
  store: StoreDto;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @Expose()
  @IsString()
  @IsOptional()
  appliedPromoCode?: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  grandTotal?: number;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}
