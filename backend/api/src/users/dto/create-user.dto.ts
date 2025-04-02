import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  Matches, // Re-add Matches for phone validation
  // IsPhoneNumber, // Remove IsPhoneNumber
  IsBoolean, // Import IsBoolean
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'First name should not be empty' })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @IsNotEmpty({ message: 'Last name should not be empty' })
  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(100)
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password cannot be longer than 100 characters' })
  // Removed pattern validation decorator
  password: string;

  @IsOptional()
  // Replace IsPhoneNumber with a regex for Israeli numbers (05X-XXXXXXX or 0X-XXXXXXX)
  @Matches(/^0\d{1,2}-?\d{7}$/, { message: 'Please provide a valid Israeli phone number (e.g., 05X-XXXXXXX or 0X-XXXXXXX)' })
  @MaxLength(20) // Keep max length just in case
  phone?: string;

  @IsOptional()
  @IsBoolean()
  newsletterOptIn?: boolean;

  @IsOptional() // Terms are validated on frontend (requiredTrue), but allow backend to receive it
  @IsBoolean()
  terms?: boolean; // Add terms field
}