import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdatePaymentMethodDto {
  @ApiPropertyOptional({ description: 'New billing address ID for this payment method', example: 'new-uuid-of-address' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  billingAddressId?: string;

  @ApiPropertyOptional({ description: 'Set as default payment method', example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  // Add other updatable fields if necessary, e.g., cardholder name, expiry (if not tokenized by gateway)
  // For tokenized cards, updates usually mean creating a new payment method and deleting the old one.
  // If you allow updating expiry for a token, that might be an option.
}