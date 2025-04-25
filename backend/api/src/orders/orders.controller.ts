import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';

// Define the shape of the request object after JWT validation
interface AuthenticatedRequest extends Request {
  user: Omit<UserEntity, 'passwordHash'>; // User payload attached by JwtStrategy.validate
}

@UseGuards(JwtAuthGuard) // Apply guard to all routes
@Controller('account/orders') // Route prefix: /api/account/orders
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.id;
    // Ensure limit is reasonable
    limit = Math.min(limit, 50); // Max 50 orders per page
    return this.ordersService.findAllForUser(userId, page, limit);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.id;
    return this.ordersService.findOneByIdAndUser(id, userId);
  }

  // POST/PATCH/DELETE for orders are likely handled elsewhere (e.g., checkout, admin panel)
}