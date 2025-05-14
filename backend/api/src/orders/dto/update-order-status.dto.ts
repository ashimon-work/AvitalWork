import { IsNotEmpty, IsIn } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsIn(['pending', 'processing', 'shipped', 'completed', 'cancelled', 'failed'])
  status: OrderStatus;
}