import {
  Controller,
  Get,
  Req,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface'; // Using AuthenticatedRequest for storeSlug
import { ShippingService } from './shipping.service';
import { ShippingMethodEntity } from './entities/shipping-method.entity';

@Controller('shipping') // Base path /api/shipping
@UseGuards(StoreContextGuard) // Ensures storeSlug is available on req
export class ShippingController {
  private readonly logger = new Logger(ShippingController.name);

  constructor(private readonly shippingService: ShippingService) {}

  @Get('methods') // Full path: GET /api/shipping/methods
  async getShippingMethods(
    @Req() req: AuthenticatedRequest,
  ): Promise<ShippingMethodEntity[]> {
    const storeSlug = req.storeSlug;
    this.logger.log(
      `Received request for shipping methods for store: ${storeSlug}`,
    );

    if (!storeSlug) {
      // This should ideally be caught by StoreContextGuard, but as a fallback:
      throw new BadRequestException(
        'Store context is missing. Cannot determine store slug.',
      );
    }
    return this.shippingService.getShippingMethodsByStoreSlug(storeSlug);
  }
}
