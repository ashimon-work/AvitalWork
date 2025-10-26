import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsPositive,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDataDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  address1: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  zipCode: string;

  @IsNotEmpty()
  @IsString()
  country: string;
}

export class CartItemDataDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;
}

export class CheckoutOrderDto {
  @IsNotEmpty()
  @IsString()
  storeSlug: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDataDto)
  cartItems: CartItemDataDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDataDto)
  shippingAddress: AddressDataDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDataDto)
  billingAddress: AddressDataDto;

  @IsNotEmpty()
  @IsString()
  shippingMethodId: string;

  @IsOptional()
  @IsBoolean()
  newsletterOptIn?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  termsAccepted: boolean;

  // Optional verification totals
  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  shippingCost?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  total?: number;
}
