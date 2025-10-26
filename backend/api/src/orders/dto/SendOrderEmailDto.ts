import { IsString, IsNotEmpty } from 'class-validator';

export class SendOrderEmailDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
