import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CategoryDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  constructor(data: Partial<CategoryDto>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description;
    this.imageUrl = data.imageUrl;
  }
}
