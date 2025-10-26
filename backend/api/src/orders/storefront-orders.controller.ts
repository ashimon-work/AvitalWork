import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { OrderDto } from './dto/order.dto';

@Controller('orders') // Will be mounted at /api/orders
export class StorefrontOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<OrderDto> {
    const userId = request.user.id;
    // The createOrderDto now includes storeId, so no need to extract from a store context guard here.
    // The service will handle fetching the store based on storeId in the DTO.
    return this.ordersService.createOrder(createOrderDto, userId);
  }
}
