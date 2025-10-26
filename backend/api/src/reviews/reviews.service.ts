import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(StoreEntity)
    private storeRepository: Repository<StoreEntity>,
  ) {}

  // Method to get reviews for a specific product
  async findByProductId(
    productId: string,
    storeSlug: string,
  ): Promise<ReviewEntity[]> {
    this.logger.log(
      `Fetching reviews for product ${productId} in store ${storeSlug}`,
    );

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const product = await this.productRepository.findOneBy({
      id: productId,
      store: { id: store.id },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${productId} not found in store ${storeSlug}.`,
      );
    }

    return this.reviewRepository.find({
      where: { product: { id: productId }, store: { id: store.id } },
      relations: ['user'], // Load user to display reviewer name
      order: { createdAt: 'DESC' }, // Show newest reviews first
    });
  }

  // Method to create a new review
  async create(
    userId: string,
    storeSlug: string,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    this.logger.log(
      `Creating review for product ${createReviewDto.productId} by user ${userId} in store ${storeSlug}`,
    );

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const product = await this.productRepository.findOneBy({
      id: createReviewDto.productId,
      store: { id: store.id },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createReviewDto.productId} not found in store ${storeSlug}.`,
      );
    }

    // Check if the user has already reviewed this product in this store
    const existingReview = await this.reviewRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: product.id },
        store: { id: store.id },
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'User has already reviewed this product in this store.',
      );
    }

    const newReview = this.reviewRepository.create({
      ...createReviewDto,
      user,
      product,
      store,
    });

    try {
      return await this.reviewRepository.save(newReview);
    } catch (error) {
      this.logger.error(`Error saving review: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to save review.');
    }
  }
}
