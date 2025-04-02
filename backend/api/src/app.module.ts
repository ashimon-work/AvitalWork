import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { AccountModule } from './account/account.module'; // Import AccountModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: '.env', // Specify path to .env file (optional, defaults might work)
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'postgres'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'password'), // Replace 'password' with a secure default or leave empty if needed
        database: configService.get<string>('POSTGRES_DB', 'magic_store'), // Default DB name
        entities: [], // Will be populated later or use autoLoadEntities
        autoLoadEntities: true, // Automatically load entities registered via forFeature()
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Sync schema in dev, disable in prod
        logging: configService.get<string>('NODE_ENV') !== 'production', // Log SQL in dev
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    AccountModule, // Add AccountModule here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
