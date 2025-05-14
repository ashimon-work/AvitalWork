import { IsString, IsNotEmpty } from 'class-validator';

export class AddCustomerNoteDto {
  @IsString()
  @IsNotEmpty()
  note: string;
}