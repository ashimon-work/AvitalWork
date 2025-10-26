import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street1: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  street2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  // state: string; // Removed state
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  @IsOptional()
  @MaxLength(20)
  // Add phone number validation pattern if needed
  phoneNumber?: string;

  @IsBoolean()
  @IsOptional()
  isDefaultShipping?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefaultBilling?: boolean;
}
