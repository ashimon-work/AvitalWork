import { Controller, Get, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus, UnauthorizedException, Req, UseGuards, BadRequestException, NotFoundException, Patch } from '@nestjs/common'; // Add Patch
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { AddressesService } from '../addresses/addresses.service';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { UpdatePersonalInfoDto } from '../users/dto/update-personal-info.dto'; // Import UpdatePersonalInfoDto

@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@Controller('account') // Base path for account-related endpoints
export class AccountController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly ordersService: OrdersService,
    private readonly addressesService: AddressesService,
    // TODO: Inject PaymentMethodsService later
  ) {}

  @Get('profile') // Endpoint: GET /api/account/profile
  getProfile(@Req() req: AuthenticatedRequest) {
    // The JwtAuthGuard ensures req.user is populated with the validated user payload
    // from the JWT (as returned by JwtStrategy.validate)
    return req.user; // Return the user details (excluding password hash)
  }

  @UseGuards(StoreContextGuard) // Apply StoreContextGuard to routes that need store context
  @Get('overview') // Endpoint: GET /api/account/overview
  async getAccountOverview(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;

    if (!storeSlug) {
      // This should ideally be handled by StoreContextGuard, but adding a check for safety
      throw new BadRequestException('Store context is missing.');
    }

    // Fetch user profile
    const userProfile = await this.usersService.findOneById(userId);
    if (!userProfile) {
      throw new NotFoundException('User profile not found.');
    }

    // Fetch recent orders (e.g., last 5 orders)
    const recentOrders = await this.ordersService.findAllForUser(userId, 1, 5); // Pass page and limit as separate arguments

    // Fetch user's addresses
    const addresses = await this.addressesService.findAllForUser(userId);

    // TODO: Fetch payment methods later

    return {
      profile: userProfile,
      recentOrders: recentOrders.orders, // Assuming findAllForUser returns { orders: [], total: number }
      addresses: addresses,
      // paymentMethods: [], // Placeholder for payment methods
    };
  }

  @Patch('personal-info') // Endpoint: PATCH /api/account/personal-info
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // Apply validation
  async updatePersonalInfo(
    @Req() req: AuthenticatedRequest,
    @Body() updatePersonalInfoDto: UpdatePersonalInfoDto,
  ) {
    const userId = req.user.id;
    const updatedUser = await this.usersService.updatePersonalInfo(userId, updatePersonalInfoDto);
    return updatedUser; // Return the updated user profile (excluding password hash)
  }


  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 No Content on success
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const userId = req.user.id;
    await this.authService.changePassword(userId, changePasswordDto);
  }

  // TODO: Add endpoints for payment methods later
  // @Get('payment-methods')
  // @UseGuards(StoreContextGuard)
  // async getPaymentMethods(@Req() req: AuthenticatedRequest) { ... }

  // @Post('payment-methods')
  // @UseGuards(StoreContextGuard)
  // async addPaymentMethod(@Req() req: AuthenticatedRequest, @Body() addPaymentMethodDto: AddPaymentMethodDto) { ... }

  // @Delete('payment-methods/:methodId')
  // @UseGuards(StoreContextGuard)
  // async deletePaymentMethod(@Req() req: AuthenticatedRequest, @Param('methodId') methodId: string) { ... }
}