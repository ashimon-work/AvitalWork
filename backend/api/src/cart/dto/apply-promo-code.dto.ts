import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ApplyPromoCodeDto {
  @IsString()
  @IsNotEmpty()
  promoCode: string;

  @IsOptional()
  @IsString()
  storeSlug?: string;
}
