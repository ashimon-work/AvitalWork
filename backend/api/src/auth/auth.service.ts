import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from '../users/entities/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<UserEntity, 'passwordHash'> | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass.trim(), user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async validateManager(
    email: string,
    pass: string,
  ): Promise<Omit<UserEntity, 'passwordHash'> | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (
      user &&
      user.roles.includes(UserRole.MANAGER) &&
      (await bcrypt.compare(pass.trim(), user.passwordHash))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<UserEntity, 'passwordHash'>) {
    const payload = { email: user.email, sub: user.id }; // Use 'sub' for user ID as per JWT standard
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Registration logic is likely handled directly in AuthController calling UsersService.create
  // Or could be moved here if more complex auth logic is needed during registration.

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersService.findOneById(userId); // Need findOneById in UsersService
    if (!user) {
      // Should not happen if called from an authenticated route, but good practice
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordMatching = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordMatching) {
      throw new BadRequestException('Incorrect current password');
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    ); // Use salt rounds

    // Update user password via UsersService
    await this.usersService.updatePassword(userId, newPasswordHash); // Need updatePassword in UsersService
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // It's generally better not to reveal if an email exists or not for security reasons
      // during password reset. So, we can return a generic success message regardless.
      // However, for internal logic, knowing if the user exists is important.
      // For this exercise, we'll proceed as if we'd send an email if the user exists.
      console.warn(`Password reset requested for non-existent email: ${email}`);
      // throw new NotFoundException('User with this email does not exist.');
      // To prevent email enumeration, always return a success-like message.
      return {
        message:
          'If an account with this email exists, a password reset link has been sent.',
      };
    }

    // In a real application:
    // 1. Generate a unique, secure password reset token.
    // 2. Store this token with an expiration date, associated with the user.
    // 3. Send an email to the user with a link containing this token.
    //    e.g., https://your-app.com/reset-password?token=THE_SECURE_TOKEN
    // For now, we'll just log and return a success message.
    console.log(
      `Simulating password reset email sent to ${email} for user ID ${user.id}`,
    );

    return {
      message:
        'If an account with this email exists, a password reset link has been sent.',
    };
  }
}
