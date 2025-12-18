import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>(
          'JWT_EXPIRATION_TIME',
          '1d',
        );

        console.log('JWT Secret Loaded Status:', secret ? 'Loaded' : 'MISSING');
        console.log('JWT ExpiresIn:', expiresIn);

        if (!secret) {
          console.error(
            'FATAL ERROR: JWT_SECRET environment variable is not set.',
          );
          throw new Error(
            'FATAL ERROR: JWT_SECRET environment variable is not set. Application cannot start.',
          );
        }

        return {
          secret: secret,
          signOptions: { expiresIn: expiresIn },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
