import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Headers,
  Logger,
} from '@nestjs/common';
import { CartService, AddToCartDto } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto';
import { v4 as uuidv4 } from 'uuid';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CartDto } from './dto/cart.dto';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreEntity } from '../stores/entities/store.entity';

// DTO for the merge cart request
export class MergeCartDto {
  @IsNotEmpty()
  @IsUUID()
  guestSessionId: string;
}

@Controller('stores/:storeSlug/cart')
export class CartController {
  private readonly logger = new Logger(CartController.name);
  constructor(
    private readonly cartService: CartService,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
  ) {}

  // Note: The StoreContextGuard will use req.params.storeSlug to validate the store
  // and attach req.storeId. The controller methods will use req.params.storeSlug
  // to pass to the service, as the service layer expects the slug.

  @Post('add')
  @UseGuards(OptionalJwtAuthGuard, StoreContextGuard) // JwtAuthGuard is optional here, handled by checking req.user
  @HttpCode(HttpStatus.CREATED)
  async addItemToCart(
    @Req() req: AuthenticatedRequest,
    @Body() addToCartDto: AddToCartDto,
    @Headers('x-guest-session-id') guestSessionIdHeader?: string,
  ): Promise<CartDto> {
    const userId = req.user?.id;
    const storeSlug: string = req.params.storeSlug; // Correctly get from route params
    let guestSessionId = guestSessionIdHeader;

    // storeSlug presence is validated by the guard now.

    if (!userId && !guestSessionId) {
      guestSessionId = uuidv4();
      this.logger.warn(
        `addItemToCart: No userId and no guestSessionId provided. Generated new one: ${guestSessionId} for store ${storeSlug}. This flow should be reviewed.`,
      );
    }

    const carts = await this.cartService.addItem(
      storeSlug,
      addToCartDto,
      userId,
      guestSessionId,
    );
    if (!carts) {
      throw new NotFoundException('Cart not found or item could not be added.');
    }
    const currentCart = Array.isArray(carts)
      ? carts.find(c => c.store.slug === req.params.storeSlug)
      : carts;

    return plainToInstance(CartDto, currentCart);
  }

  @Get()
  @UseGuards(StoreContextGuard)
  async getCart(
    @Req() req: AuthenticatedRequest,
    @Headers('x-guest-session-id') guestSessionIdHeader?: string,
  ): Promise<CartDto> {
    const userId = req.user?.id;
    const storeSlug: string = req.params.storeSlug; // Correctly get from route params
    const guestSessionId = guestSessionIdHeader;
    const storeId = req.storeId; // From StoreContextGuard

    // storeSlug presence is validated by the guard.

    this.logger.log(
      `CartController: getCart called. UserID: ${userId}, GuestSessionID Header: ${guestSessionIdHeader}, StoreSlug from params: ${storeSlug}`,
    );

    const store = await this.storeRepository.findOneBy({ id: storeId });
    if (!store) {
      this.logger.error(`Store not found with id: ${storeId} for slug: ${storeSlug}`);
      throw new NotFoundException('Store not found.');
    }

    const cart = await this.cartService.getCart(
      storeSlug,
      userId,
      guestSessionId,
    );

    if (!cart) {
      if (!userId) {
        const newGuestSessionId = uuidv4();
        this.logger.log(
          `CartController: No cart found for guest. Generating new guestSessionId: ${newGuestSessionId} for store ${storeSlug}`,
        );
        // Return a structure that CartService.loadInitialCart can understand for new guest carts
        return plainToInstance(
          CartDto,
          {
            id: null, // No persisted cart ID yet
            guest_session_id: newGuestSessionId, // The new ID for the frontend to store
            items: [],
            subtotal: 0,
            grandTotal: 0,
            discountAmount: 0,
            appliedPromoCode: null,
            store: store,
            user: null, // No user for guest cart
            // Ensure all fields expected by Cart interface are present
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
          },
        );
      } else {
        // For logged-in users, if cartService.getCart returns null, it means no cart exists.
        // We could create one here, or let the service handle it.
        // For now, let's assume if a logged-in user has no cart, it's an issue or needs creation by service.
        // The service.addItem already creates a cart if one doesn't exist for a user.
        // So, for getCart, if it's null for a user, it means there's genuinely no cart.
        this.logger.warn(
          `CartController: No cart found for user ${userId} in store ${storeSlug}. Consider creating one if this is unexpected.`,
        );
        throw new NotFoundException('Cart not found for this user and store.');
      }
    }
    return plainToInstance(CartDto, cart, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Patch(':cartItemId')
  @UseGuards(OptionalJwtAuthGuard, StoreContextGuard) async updateItemQuantity(
    @Req() req: AuthenticatedRequest,
    @Param('cartItemId') cartItemId: string,
    @Body() updateDto: { quantity: number },
    @Headers('x-guest-session-id') guestSessionIdHeader?: string,
  ): Promise<CartDto> {
    this.logger.error('--- DEBUG CART UPDATE ---');
    this.logger.error('req.user:', req.user);
    this.logger.error('req.user?.id:', req.user?.id);
    this.logger.error('x-guest-session-id:', guestSessionIdHeader);
    this.logger.error('storeSlug:', req.params.storeSlug);
    this.logger.error('cartItemId:', cartItemId);
    this.logger.error('quantity:', updateDto.quantity);

    const userId = req.user?.id;
    const storeSlug: string = req.params.storeSlug; // Correctly get from route params
    // Only use guestSessionId if user is not logged in
    const guestSessionId = userId ? undefined : guestSessionIdHeader;

    // storeSlug presence is validated by the guard.

    if (!userId && !guestSessionId) {
      throw new BadRequestException(
        'Cart identifier (userId or guestSessionId) is missing.',
      );
    }

    this.logger.log(
      `updateItemQuantity: Updating item ${cartItemId} to quantity ${updateDto.quantity} for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}) in store ${storeSlug}`,
    );

    const updatedCart = await this.cartService.updateItemQuantity(
      storeSlug,
      cartItemId,
      updateDto.quantity,
      userId,
      guestSessionId,
    );
    if (!updatedCart) {
      throw new NotFoundException('Cart or item not found for update.');
    }
    return plainToInstance(CartDto, updatedCart, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Delete(':cartItemId')
  @UseGuards(OptionalJwtAuthGuard, StoreContextGuard) // JwtAuthGuard is optional
  @HttpCode(HttpStatus.OK)
  async removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('cartItemId') cartItemId: string,
    @Headers('x-guest-session-id') guestSessionIdHeader?: string,
  ): Promise<CartDto> {
    const userId = req.user?.id;
    const storeSlug: string = req.params.storeSlug; // Correctly get from route params
    // Only use guestSessionId if user is not logged in
    const guestSessionId = userId ? undefined : guestSessionIdHeader;

    // storeSlug presence is validated by the guard.

    if (!userId && !guestSessionId) {
      throw new BadRequestException(
        'Cart identifier (userId or guestSessionId) is missing.',
      );
    }

    this.logger.log(
      `removeItem: Removing item ${cartItemId} for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}) in store ${storeSlug}`,
    );

    const updatedCart = await this.cartService.removeItem(
      storeSlug,
      cartItemId,
      userId,
      guestSessionId,
    );
    if (!updatedCart) {
      throw new NotFoundException('Cart or item not found for removal.');
    }
    return plainToInstance(CartDto, updatedCart, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Post('promo')
  @UseGuards(StoreContextGuard) // JwtAuthGuard is optional, but promo might be user-specific
  @HttpCode(HttpStatus.OK)
  async applyPromoCode(
    @Req() req: AuthenticatedRequest,
    @Body() applyPromoCodeDto: ApplyPromoCodeDto,
    @Headers('x-guest-session-id') guestSessionIdHeader?: string,
  ): Promise<CartDto> {
    const userId = req.user?.id;
    const contextStoreSlug: string = req.params.storeSlug; // Correctly get from route params
    const guestSessionId = guestSessionIdHeader;

    // storeSlug presence is validated by the guard.
    // applyPromoCodeDto.storeSlug might be redundant if contextStoreSlug is always used from param.
    // For now, service uses applyPromoCodeDto.storeSlug first, then contextStoreSlug.

    if (!userId && !guestSessionId) {
      throw new BadRequestException(
        'Cart identifier (userId or guestSessionId) is missing for applying promo code.',
      );
    }

    const result = await this.cartService.applyPromoCode(
      userId,
      applyPromoCodeDto,
      contextStoreSlug,
      guestSessionId,
    );

    if (
      result &&
      typeof result === 'object' &&
      'error' in result &&
      'message' in result
    ) {
      const errorResult = result as { error: string; message: string };
      if (errorResult.error === 'CART_NOT_FOUND') {
        throw new NotFoundException(errorResult.message);
      } else if (
        errorResult.error === 'PROMO_CODE_NOT_FOUND' ||
        errorResult.error === 'PROMO_CODE_INACTIVE' ||
        errorResult.error === 'PROMO_CODE_EXPIRED' ||
        errorResult.error === 'STORE_MISMATCH' ||
        errorResult.error === 'MIN_CART_VALUE_NOT_MET'
      ) {
        throw new BadRequestException(errorResult.message);
      }
      throw new BadRequestException('Failed to apply promo code.');
    } else if (!result) {
      throw new NotFoundException(
        'Cart not found or unable to apply promo code.',
      );
    }

    return plainToInstance(CartDto, result, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard, StoreContextGuard) // User must be logged in to merge. StoreContextGuard provides storeId.
  @HttpCode(HttpStatus.OK)
  async mergeGuestCart(
    @Req() req: AuthenticatedRequest,
    @Body() mergeCartDto: MergeCartDto,
  ): Promise<CartDto> {
    const userId = req.user.id; // From JwtAuthGuard
    const storeId = req.storeId; // From StoreContextGuard
    const storeSlug = req.params.storeSlug; // For logging or if service needs it

    this.logger.log(
      `mergeGuestCart: User ${userId} attempting to merge guest cart ${mergeCartDto.guestSessionId} for store slug ${storeSlug} (ID: ${storeId})`,
    );

    if (!storeId) {
      this.logger.error(
        `mergeGuestCart: StoreId not found on request for slug ${storeSlug}. Guard issue?`,
      );
      throw new BadRequestException('Store context could not be determined.');
    }

    const mergedCart = await this.cartService.mergeCarts(
      userId,
      storeId,
      storeSlug,
      mergeCartDto.guestSessionId,
    );
    if (!mergedCart) {
      // This could mean the user's cart couldn't be created/found, or guest cart was invalid.
      // The service should throw specific errors if needed.
      throw new BadRequestException(
        'Failed to merge cart. Guest cart may be invalid or user cart inaccessible.',
      );
    }
    return plainToInstance(CartDto, mergedCart, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }
}
