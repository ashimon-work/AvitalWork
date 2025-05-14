import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsCreditCard, IsInt, Min, Max, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({ description: 'Type of the payment method (e.g., "card")', example: 'card' })
  @IsString()
  @IsNotEmpty()
  type: string; // 'card', 'paypal', etc.

  @ApiProperty({ description: 'Details of the payment method (e.g., token from payment gateway)', example: 'tok_visa' })
  @IsString()
  @IsNotEmpty()
  paymentGatewayToken: string; // This would be the token from Stripe, Braintree, etc.

  // The following fields are for illustrative purposes if you were to store card details directly
  // which is NOT recommended for PCI compliance. Store tokens instead.
  // These are commented out but show what might be included if not using a gateway token.

  // @ApiProperty({ description: 'Cardholder name', example: 'Jane Doe' })
  // @IsString()
  // @IsNotEmpty()
  // cardholderName?: string;

  // @ApiProperty({ description: 'Card number', example: '************1234' })
  // @IsCreditCard()
  // cardNumber?: string; // Should be tokenized or only last 4 digits stored

  // @ApiProperty({ description: 'Expiration month (MM)', example: 12 })
  // @IsInt()
  // @Min(1)
  // @Max(12)
  // expiryMonth?: number;

  // @ApiProperty({ description: 'Expiration year (YYYY)', example: 2025 })
  // @IsInt()
  // @Min(new Date().getFullYear()) // Ensure year is not in the past
  // expiryYear?: number;

  // @ApiProperty({ description: 'CVV/CVC', example: '123' })
  // @IsString()
  // @Length(3,4)
  // cvv?: string; // NEVER store CVV

  @ApiProperty({ description: 'Billing address ID associated with this payment method', example: 'uuid-of-address' })
  @IsString()
  @IsNotEmpty()
  billingAddressId: string;

  @ApiProperty({ description: 'Is this the default payment method?', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}