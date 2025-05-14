import { IsBoolean, IsOptional, IsDate } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsDate()
  readAt?: Date | null;
}