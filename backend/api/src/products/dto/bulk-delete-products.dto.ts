import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class BulkDeleteProductsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true }) // Assuming UUID v4 for product IDs
  productIds: string[];
}