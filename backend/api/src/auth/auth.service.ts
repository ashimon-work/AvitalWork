import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity'; // Use the actual entity class name

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<UserEntity, 'passwordHash'> | null> {
    const user = await this.usersService.findOneByEmail(email); // findOneByEmail should return UserEntity | null
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user; // Use passwordHash and remove it
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
}