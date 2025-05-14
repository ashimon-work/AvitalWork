import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendCustomerEmailDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000) // Assuming a reasonable max length for email body
  body: string;
}