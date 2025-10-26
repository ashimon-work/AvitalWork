import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './entities/review.entity';

@UseGuards(StoreContextGuard)
@Controller('stores/:storeSlug/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('products/:productId')
  async findByProductId(
    @Req() req: AuthenticatedRequest,
    @Param('productId') productId: string,
    @Param('storeSlug') routeStoreSlug: string,
  ): Promise<ReviewEntity[]> {
    return this.reviewsService.findByProductId(productId, routeStoreSlug);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createReviewDto: CreateReviewDto,
    @Param('storeSlug') routeStoreSlug: string,
  ): Promise<ReviewEntity> {
    const userId = req.user.id;
    // TODO: Add validation pipe for createReviewDto
    return this.reviewsService.create(userId, routeStoreSlug, createReviewDto);
  }
}
