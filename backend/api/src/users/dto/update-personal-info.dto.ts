import { IsOptional, IsString, MaxLength, IsPhoneNumber } from 'class-validator';

export class UpdatePersonalInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  lastName?: string;

  @IsOptional()
  @IsString()
  // Consider using a more specific phone number validation if needed
  // @IsPhoneNumber('ZZ') // 'ZZ' for any country, or specify a country code
  @MaxLength(20)
  phone?: string;
}