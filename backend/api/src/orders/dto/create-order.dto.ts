import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO for items within the CreateOrderDto
export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  priceAtPurchase: number;
}
export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  storeId: string;

  @IsNotEmpty()
  @IsUUID()
  shippingAddressId: string;

  @IsOptional()
  @IsUUID()
  billingAddressId?: string;

  @IsNotEmpty()
  @IsString()
  shippingMethod: string; // e.g., 'standard-shipping-id', 'express-shipping-id' or details

  @IsOptional()
  @IsString()
  promoCode?: string;

  // Optional fields that might be sent from frontend for verification
  @IsOptional()
  @IsNumber()
  subtotalAmount?: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  shippingCostAmount?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  grandTotalAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  // TODO: Define a proper DTO for payment details based on integration
  paymentDetails?: any; // Placeholder for payment details
}
