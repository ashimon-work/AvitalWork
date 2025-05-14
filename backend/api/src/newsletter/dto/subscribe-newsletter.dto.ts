import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubscribeNewsletterDto {
  @ApiProperty({
    description: 'Email address of the subscriber',
    example: 'test@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Source of the subscription (e.g., "footer-signup", "popup")',
    example: 'footer-signup',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;
}