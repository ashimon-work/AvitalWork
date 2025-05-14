import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';

export class UpdateManagerCustomerDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber() // Allows any country code
  phone?: string;

  // Add other fields a manager is allowed to update if necessary,
  // e.g., address fields if they are part of CreateUserDto or a related DTO
}