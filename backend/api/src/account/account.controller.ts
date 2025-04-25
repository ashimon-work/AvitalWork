import { Controller, Get, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common'; // Add Post, Body, HttpCode, HttpStatus
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import the guard
import { UserEntity } from '../users/entities/user.entity'; // Import UserEntity
import { AuthService } from '../auth/auth.service'; // Import AuthService
import { ChangePasswordDto } from '../auth/dto/change-password.dto'; // Import DTO

// Define the shape of the request object after JWT validation
interface AuthenticatedRequest extends Request {
  user: Omit<UserEntity, 'passwordHash'>; // User payload attached by JwtStrategy.validate
}

@Controller('account') // Base path for account-related endpoints
export class AccountController {
  constructor(private readonly authService: AuthService) {} // Inject AuthService

  @UseGuards(JwtAuthGuard) // Protect this route with the JWT guard
  @Get('profile') // Endpoint: GET /api/account/profile
  getProfile(@Request() req: AuthenticatedRequest) {
    // The JwtAuthGuard ensures req.user is populated with the validated user payload
    // from the JWT (as returned by JwtStrategy.validate)
    return req.user; // Return the user details (excluding password hash)
  }

  // Add other account endpoints here later (e.g., update profile, get orders)
  // @Get('orders')
  // @UseGuards(JwtAuthGuard)
  // getOrders(@Request() req: AuthenticatedRequest) { ... }

  // @Patch('profile')
  // @UseGuards(JwtAuthGuard)
  // updateProfile(@Request() req: AuthenticatedRequest, @Body() updateDto: UpdateProfileDto) { ... }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 No Content on success
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const userId = req.user.id;
    await this.authService.changePassword(userId, changePasswordDto);
  }
}