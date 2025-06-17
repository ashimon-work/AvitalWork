import { IsNumber, IsString, IsOptional, IsEmail, Min } from 'class-validator';

export class ProcessPaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string; // e.g., 'ILS', 'USD'

  @IsString()
  orderDescription: string;

  @IsString()
  internalOrderId: string;

  @IsString()
  @IsOptional()
  creditCardToken?: string; // Tranzila token

  @IsString()
  @IsOptional()
  expdate?: string; // MMYY format
} 