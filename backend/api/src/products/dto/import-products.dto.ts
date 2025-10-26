import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ImportProductItemDto } from './import-product-item.dto';

export class ImportProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportProductItemDto)
  products: ImportProductItemDto[];
}
