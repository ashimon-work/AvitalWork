import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service'; // Import AuthService
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy'; // Import JwtStrategy

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({ // Configure JwtModule asynchronously
      imports: [ConfigModule], // Import ConfigModule to use ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get secret from .env
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') }, // Get expiration from .env
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
    ConfigModule, // Make sure ConfigModule is imported if not globally available
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Provide AuthService and JwtStrategy
  exports: [AuthService], // Export AuthService if needed elsewhere
})
export class AuthModule {}
