import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import the guard
import { UserEntity } from '../users/entities/user.entity'; // Import UserEntity

// Define the shape of the request object after JWT validation
interface AuthenticatedRequest extends Request {
  user: Omit<UserEntity, 'passwordHash'>; // User payload attached by JwtStrategy.validate
}

@Controller('account') // Base path for account-related endpoints
export class AccountController {
  // Constructor could inject services if needed for more complex logic

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
}