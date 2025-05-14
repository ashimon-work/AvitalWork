import { IsNotEmpty, IsString } from 'class-validator';

export class Confirm2faDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}