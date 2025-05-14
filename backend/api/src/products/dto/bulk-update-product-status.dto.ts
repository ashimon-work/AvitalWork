import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';

export class BulkUpdateProductStatusDto {
  @ApiProperty({ description: 'Array of product IDs to update' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  productIds: string[];

  @ApiProperty({ description: 'New status for the products' })
  @IsString()
  @IsNotEmpty()
  status: string;
}