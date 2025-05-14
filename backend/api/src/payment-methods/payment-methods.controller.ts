import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards, HttpCode, HttpStatus, BadRequestException, Patch, ValidationPipe } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodEntity } from './entities/payment-method.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Account - Payment Methods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('account/payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @ApiOperation({ summary: "Get all user's payment methods for the current store" })
  @ApiResponse({ status: 200, description: 'List of payment methods.', type: [PaymentMethodEntity] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Store context missing.' })
  async findAllForUser(@Req() req: AuthenticatedRequest): Promise<PaymentMethodEntity[]> {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    return this.paymentMethodsService.findAllForUser(userId, storeSlug);
  }

  @Get(':methodId')
  @ApiOperation({ summary: "Get a specific payment method by ID for the current store" })
  @ApiParam({ name: 'methodId', description: 'ID of the payment method', type: String })
  @ApiResponse({ status: 200, description: 'The payment method.', type: PaymentMethodEntity })
  @ApiResponse({ status: 404, description: 'Payment method not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findOneForUser(@Req() req: AuthenticatedRequest, @Param('methodId') methodId: string): Promise<PaymentMethodEntity> {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    return this.paymentMethodsService.findOneForUser(userId, storeSlug, methodId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add a new payment method for the user in the current store" })
  @ApiBody({ type: CreatePaymentMethodDto })
  @ApiResponse({ status: 201, description: 'Payment method created successfully.', type: PaymentMethodEntity })
  @ApiResponse({ status: 400, description: 'Invalid input or missing store context.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createForUser(
    @Req() req: AuthenticatedRequest,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethodEntity> {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    return this.paymentMethodsService.createForUser(userId, storeSlug, createPaymentMethodDto);
  }

  @Patch(':methodId')
  @ApiOperation({ summary: "Update an existing payment method for the user in the current store" })
  @ApiParam({ name: 'methodId', description: 'ID of the payment method to update', type: String })
  @ApiBody({ type: UpdatePaymentMethodDto })
  @ApiResponse({ status: 200, description: 'Payment method updated successfully.', type: PaymentMethodEntity })
  @ApiResponse({ status: 400, description: 'Invalid input or missing store context.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Payment method not found.' })
  async updateForUser(
    @Req() req: AuthenticatedRequest,
    @Param('methodId') methodId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodEntity> {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    return this.paymentMethodsService.updateForUser(userId, storeSlug, methodId, updatePaymentMethodDto);
  }

  @Delete(':methodId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a payment method for the user in the current store" })
  @ApiParam({ name: 'methodId', description: 'ID of the payment method to delete', type: String })
  @ApiResponse({ status: 204, description: 'Payment method deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Payment method not found.' })
  async deleteForUser(@Req() req: AuthenticatedRequest, @Param('methodId') methodId: string): Promise<void> {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    await this.paymentMethodsService.deleteForUser(userId, storeSlug, methodId);
  }
}