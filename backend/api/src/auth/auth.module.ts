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
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        // Provide a default value like '1d' if the env var is missing
        const expiresIn = configService.get<string>('JWT_EXPIRATION_TIME', '1d');

        // Log the values to check if they are being read correctly
        console.log('JWT Secret:', secret ? 'Loaded' : 'MISSING');
        console.log('JWT ExpiresIn:', expiresIn);

        if (!secret) {
          console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
          // Optionally throw an error to prevent startup without secret
          // throw new Error('JWT_SECRET environment variable is not set.');
        }

        return {
          secret: secret,
          signOptions: { expiresIn: expiresIn },
        };
      },
      inject: [ConfigService], // Inject ConfigService
    }),
    ConfigModule, // Make sure ConfigModule is imported if not globally available
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Provide AuthService and JwtStrategy
  exports: [AuthService], // Export AuthService if needed elsewhere
})
export class AuthModule {}
