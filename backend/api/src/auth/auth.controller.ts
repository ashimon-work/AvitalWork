import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginManagerDto } from './dto/login-manager.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.CREATED) // Return 201 Created on success
  async register(@Body() createUserDto: CreateUserDto) {
    // The ValidationPipe handles input validation based on DTO decorators
    const user = await this.usersService.create(createUserDto);
    // Return the created user (without password hash)
    return {
      message: 'Registration successful',
      user: user,
    };
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK) // Return 200 OK on success
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // If validation is successful, AuthService.login generates and returns the JWT
    return this.authService.login(user);
  }

  @Post('manager/login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async managerLogin(@Body() loginManagerDto: LoginManagerDto) {
    const manager = await this.authService.validateManager(
      loginManagerDto.email,
      loginManagerDto.password,
    );
    if (!manager) {
      throw new UnauthorizedException('Invalid manager credentials');
    }
    return this.authService.login(manager);
  }

  @Post('manager/forgot-password')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async managerForgotPassword(@Body('email') email: string) {
    // Assuming the backend AuthService.forgotPassword is generic enough
    // or can handle manager context if needed (e.g., different email template)
    const result = await this.authService.forgotPassword(email);
    // The authService.forgotPassword likely returns a success message or handles errors.
    // We can return that directly.
    return result;
  }
}
