import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductEntity } from './src/products/entities/product.entity';
import { CategoryEntity } from './src/categories/entities/category.entity';
import { StoreEntity } from './src/stores/entities/store.entity'; // Import StoreEntity
import { UserEntity } from './src/users/entities/user.entity'; // Import UserEntity
// Import other entities as they are created
// Load environment variables directly for CLI usage
// Note: NestJS app uses ConfigModule, but CLI needs direct access
import * as dotenv from 'dotenv';
dotenv.config(); // Load .env file if present (optional, Docker Compose provides env vars)

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'db', // Default to Docker service name 'db'
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password', // Ensure POSTGRES_PASSWORD is set in .env or via Docker Compose
  database: process.env.POSTGRES_DB || 'magic_store_prod', // Match DB name used in compose
  entities: [
    ProductEntity,
    CategoryEntity,
    StoreEntity,
    UserEntity, // Add UserEntity here
    // Add other entities here
    // __dirname + '/../**/*.entity{.ts,.js}', // Alternative: Use glob pattern
  ],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'], // Path to migration files
  synchronize: false, // IMPORTANT: Set to false for production and migration use
  logging: process.env.NODE_ENV === 'development', // Log SQL in dev
};

// Export a DataSource instance for TypeORM CLI
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;