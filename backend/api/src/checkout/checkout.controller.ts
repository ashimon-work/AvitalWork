import { Controller, Get, Post, Body, Req, UseGuards, HttpCode, HttpStatus, BadRequestException, NotFoundException, Param, Query, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CheckoutService } from './checkout.service';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { TaxEstimateQueryDto } from './dto/tax-estimate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '../tranzila/entities/credit-card.entity';

@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    @InjectRepository(CreditCardEntity)
    private readonly creditCardRepository: Repository<CreditCardEntity>,
    ) {}

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

  @Post('orders') // Path: /api/checkout/orders or /api/orders
  @HttpCode(HttpStatus.CREATED)
  async processOrder(@Req() req: AuthenticatedRequest, @Body() createOrderDto: CheckoutOrderDto) {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;
     if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    // TODO: Add validation pipe for createOrderDto
    return this.checkoutService.processOrder(userId, storeSlug, createOrderDto);
  }

  @Get('tranzila/me/credit-card')
  @UseGuards(JwtAuthGuard, StoreContextGuard)
    async getMyCreditCard(@Req() req: AuthenticatedRequest) {
        const userId = req.user.id;
        const creditCard = await this.creditCardRepository.findOne({
          where: { user: { id: userId } },
        });
        if (!creditCard) {
          return {};
        }
        return {
          lastFour: creditCard.lastFour,
          expdate: creditCard.expdate,
          isDefault: creditCard.isDefault,
        };
    }
}