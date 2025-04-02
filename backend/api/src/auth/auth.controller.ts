import { Controller, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service'; // Import AuthService
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto'; // Import LoginUserDto

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService, // Inject AuthService
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // Apply validation
  @HttpCode(HttpStatus.CREATED) // Return 201 Created on success
  async register(@Body() createUserDto: CreateUserDto) {
    // The ValidationPipe handles input validation based on DTO decorators
    const user = await this.usersService.create(createUserDto);
    // Return the created user (without password hash)
    return {
       message: 'Registration successful',
       user: user
    };
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK) // Return 200 OK on success
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // If validation is successful, AuthService.login generates and returns the JWT
    return this.authService.login(user);
  }
}
