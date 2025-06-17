import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class TranzilaNotifyDto {
  @IsString()
  @IsNotEmpty()
  TranzilaTK: string; // Payment token

  @IsString()
  @IsNotEmpty()
  userId: string; // Internal user ID

  @IsString()
  @IsOptional()
  expyear?: string; // Card expiry year (YY format)

  @IsString()
  @IsOptional()
  expmonth?: string; // Card expiry month (MM format)

  @IsString()
  @IsOptional()
  ccno?: string; // Last 4 digits of the card

  // Allow additional fields that Tranzila might send
  [key: string]: any;
} 