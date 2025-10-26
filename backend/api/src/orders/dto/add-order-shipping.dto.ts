import { IsString, IsNotEmpty } from 'class-validator';

export class AddOrderShippingDto {
  @IsString()
  @IsNotEmpty()
  trackingNumber: string;

  @IsString()
  @IsNotEmpty()
  carrier: string;
}
