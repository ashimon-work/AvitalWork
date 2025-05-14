import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class TestPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;
}