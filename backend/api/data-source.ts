import { DataSource, DataSourceOptions } from 'typeorm';
import { ProductEntity } from './src/products/entities/product.entity';
import { CategoryEntity } from './src/categories/entities/category.entity';
import { StoreEntity } from './src/stores/entities/store.entity';
import { UserEntity } from './src/users/entities/user.entity';
import { CarouselItem } from './src/carousel/entities/carousel.entity';
import { AddressEntity } from './src/addresses/entities/address.entity';
import { OrderEntity } from './src/orders/entities/order.entity';
import { OrderItemEntity } from './src/orders/entities/order-item.entity';
import { WishlistEntity } from './src/wishlist/entities/wishlist.entity';
import { WishlistItemEntity } from './src/wishlist/entities/wishlist-item.entity';
import { CartEntity } from './src/cart/entities/cart.entity';
import { CartItemEntity } from './src/cart/entities/cart-item.entity';
import * as dotenv from 'dotenv';
import { ProductVariantEntity } from './src/products/entities/product-variant.entity';
import { FaqEntity } from './src/contact/entities/faq.entity';
import { AboutContentEntity } from './src/stores/entities/about-content.entity';
import { TestimonialEntity } from './src/stores/entities/testimonial.entity';
import { LoginHistoryEntity } from './src/login-history/entities/login-history.entity';
import { ContactSubmissionEntity } from './src/contact/entities/contact-submission.entity';
import { NewsletterSubscription } from './src/newsletter/entities/newsletter-subscription.entity';
import { PaymentMethodEntity } from './src/payment-methods/entities/payment-method.entity';
import { NotificationEntity } from './src/notifications/entities/notification.entity';
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env['POSTGRES_HOST'] || 'db',
  port: parseInt(process.env['POSTGRES_PORT'] || '5432', 10),
  username: process.env['POSTGRES_USER'] || 'postgres',
  password: process.env['POSTGRES_PASSWORD'] || 'password',
  database: process.env['POSTGRES_DB'] || 'magic_store_prod',
  entities: [
    ProductEntity,
    CategoryEntity,
    StoreEntity,
    UserEntity,
    CarouselItem,
    AddressEntity,
    OrderEntity,
    OrderItemEntity,
    WishlistEntity,
    WishlistItemEntity,
    ProductVariantEntity,
    CartEntity,
    CartItemEntity,
    FaqEntity,
    AboutContentEntity,
    TestimonialEntity,
    LoginHistoryEntity,
    ContactSubmissionEntity,
    NewsletterSubscription,
    PaymentMethodEntity,
    NotificationEntity,
    // Add other entities here
    // __dirname + '/../**/*.entity{.ts,.js}', // Alternative: Use glob pattern
  ],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  synchronize: false, // IMPORTANT: Set to false for production and migration use
  logging: process.env['NODE_ENV'] === 'development',
};

// Export a DataSource instance for TypeORM CLI
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;