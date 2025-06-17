import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CartItemDto } from './cart-item.dto';
import { StoreDto } from '../../stores/dto/store.dto';

export class CartDto {
  @IsUUID()
  id: string;

  @IsUUID()
  @IsOptional()
  guestCartId?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @ValidateNested()
  @Type(() => StoreDto)
  store: StoreDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsString()
  @IsOptional()
  appliedPromoCode?: string;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  grandTotal?: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
} 