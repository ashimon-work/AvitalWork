import { DataSource, DataSourceOptions } from 'typeorm';
import { ProductEntity } from './src/products/entities/product.entity';
import { CategoryEntity } from './src/categories/entities/category.entity';
import { StoreEntity } from './src/stores/entities/store.entity';
import { UserEntity } from './src/users/entities/user.entity';
import { CarouselItem } from './src/carousel/entities/carousel.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'db',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'magic_store_prod',
  entities: [
    ProductEntity,
    CategoryEntity,
    StoreEntity,
    UserEntity,
    CarouselItem,
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