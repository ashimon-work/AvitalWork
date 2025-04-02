import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductEntity } from './src/products/entities/product.entity';
import { CategoryEntity } from './src/categories/entities/category.entity';
// Import other entities as they are created

// Load environment variables to use in configuration
ConfigModule.forRoot({
  isGlobal: true, // Make ConfigModule global if not already done in AppModule
  envFilePath: '.env', // Specify your .env file path
});

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'password'),
  database: configService.get<string>('DB_DATABASE', 'magic_store'),
  entities: [
    ProductEntity,
    CategoryEntity,
    // Add other entities here
    // __dirname + '/../**/*.entity{.ts,.js}', // Alternative: Use glob pattern
  ],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'], // Path to migration files
  synchronize: false, // IMPORTANT: Set to false for production and migration use
  logging: configService.get<string>('NODE_ENV') === 'development', // Log SQL in dev
};

// Export a DataSource instance for TypeORM CLI
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;