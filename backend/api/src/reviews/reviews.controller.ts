import { Controller, Get, Post, Body, Param, Req, UseGuards, HttpCode, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './entities/review.entity'; // Import ReviewEntity if returning entities

@UseGuards(JwtAuthGuard, StoreContextGuard) // Protect all routes in this controller
@Controller('reviews') // Base path for reviews endpoints
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('/products/:productId')
  async findByProductId(@Req() req: AuthenticatedRequest, @Param('productId') productId: string): Promise<ReviewEntity[]> {
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    return this.reviewsService.findByProductId(productId, storeSlug);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: AuthenticatedRequest, @Body() createReviewDto: CreateReviewDto): Promise<ReviewEntity> {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;
     if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    // TODO: Add validation pipe for createReviewDto
    return this.reviewsService.create(userId, storeSlug, createReviewDto);
  }
}