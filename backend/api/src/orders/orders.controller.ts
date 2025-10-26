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
import { StoreContextGuard } from '../core/guards/store-context.guard'; // Import StoreContextGuard
import {
  FindAllManagerOrdersDto,
  OrderSortField,
  SortOrder,
} from './dto/find-all-manager-orders.dto';

// Define the shape of the request object after guard validation
interface ManagerAuthenticatedRequest extends Request {
  storeId: string; // Store ID attached by StoreContextGuard
  // Add manager user info if needed later
}

@UseGuards(StoreContextGuard) // Apply StoreContextGuard
@Controller('manager/orders') // Route prefix: /api/manager/orders
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('recent') // Specific endpoint for recent orders on dashboard
  findAllRecent(
    @Request() req: ManagerAuthenticatedRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortColumn', new DefaultValuePipe('orderDate')) sortColumn: string,
    @Query('sortDirection', new DefaultValuePipe('desc'))
    sortDirection: 'asc' | 'desc',
  ) {
    const storeId = req.storeId;
    // Ensure limit is reasonable
    limit = Math.min(limit, 50); // Max 50 orders per page
    // The service method is findAllForManager, not findAllForStore
    // The service method expects a DTO, not individual parameters
    // Need to create a DTO object from the query parameters
    const queryDto: FindAllManagerOrdersDto = {
      page,
      limit,
      sortBy: sortColumn as OrderSortField, // Cast to OrderSortField
      sortOrder: sortDirection === 'asc' ? SortOrder.ASC : SortOrder.DESC, // Map string to SortOrder enum
      // Add other potential query parameters like search, status, startDate, endDate if needed for this endpoint
    };
    return this.ordersService.findAllForManager(storeId, queryDto);
  }

  // Endpoint to get a single order by ID (for manager)
  @Get(':id')
  findOneForManager(
    @Request() req: ManagerAuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const storeId = req.storeId;
    // The service method is findOneForManager, not findOneByIdAndStore
    return this.ordersService.findOneForManager(storeId, id);
  }

  // POST/PATCH/DELETE for orders are likely handled elsewhere (e.g., checkout, admin panel)
}
