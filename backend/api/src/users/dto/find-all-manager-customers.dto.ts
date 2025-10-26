import {
  IsOptional,
  IsString,
  IsNumberString,
  IsIn,
  IsDateString,
} from 'class-validator';

export class FindAllManagerCustomersDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'name-asc',
    'name-desc',
    'signup-asc',
    'signup-desc',
    'last-order-asc',
    'last-order-desc',
    'total-spent-asc',
    'total-spent-desc',
  ])
  sort?: string;

  @IsOptional()
  @IsDateString()
  signup_date_min?: string;

  @IsOptional()
  @IsDateString()
  signup_date_max?: string;

  @IsOptional()
  @IsNumberString()
  total_spent_min?: string;

  @IsOptional()
  @IsNumberString()
  total_spent_max?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;
}
