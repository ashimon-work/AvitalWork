import { IsNotEmpty, IsString, MaxLength, IsEmail } from 'class-validator';

export class ContactFormDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  subject: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  message: string;
}
