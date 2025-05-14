import { IsNotEmpty, IsUUID, IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number; // Rating from 1 to 5

  @IsOptional()
  @IsString()
  @MaxLength(1000) // Limit comment length
  comment?: string;
}