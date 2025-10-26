import { IsEmail, IsNotEmpty } from 'class-validator';

export class TestEmailDto {
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;
}
