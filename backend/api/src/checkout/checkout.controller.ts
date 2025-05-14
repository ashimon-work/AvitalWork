import { Controller, Get, Post, Body, Req, UseGuards, HttpCode, HttpStatus, BadRequestException, NotFoundException, Param, Query, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CheckoutService } from './checkout.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { TaxEstimateQueryDto } from './dto/tax-estimate.dto';

@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('shipping/methods')
  async getShippingMethods(@Req() req: AuthenticatedRequest) {
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    return this.checkoutService.getShippingMethods(storeSlug);
  }

  @Get('tax/estimate')
  async getTaxEstimate(
    @Req() req: AuthenticatedRequest,
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) query: TaxEstimateQueryDto
  ) {
     const storeSlug = req.storeSlug;
     if (!storeSlug) {
         throw new BadRequestException('Store context is missing.');
     }
     return this.checkoutService.getTaxEstimate(storeSlug, query);
  }

  @Post('orders') // Endpoint: POST /api/orders
  @HttpCode(HttpStatus.CREATED) // Return 201 Created on success
  async processOrder(@Req() req: AuthenticatedRequest, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;
     if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    // TODO: Add validation pipe for createOrderDto
    return this.checkoutService.processOrder(userId, storeSlug, createOrderDto);
  }
}