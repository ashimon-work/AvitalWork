import { Controller, Post, Body, HttpCode, HttpStatus, Get, Patch, Delete, Param, ParseIntPipe, Req, UseGuards, NotFoundException, BadRequestException, Headers, Logger } from '@nestjs/common';
import { CartService, AddToCartDto } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto';
import { v4 as uuidv4 } from 'uuid';
import { IsNotEmpty, IsUUID } from 'class-validator';

// DTO for the merge cart request
export class MergeCartDto {
  @IsNotEmpty()
  @IsUUID()
  guestCartId: string;
}

@Controller('stores/:storeSlug/cart')
export class CartController {
  private readonly logger = new Logger(CartController.name);
  constructor(private readonly cartService: CartService) { }

  // Note: The StoreContextGuard will use req.params.storeSlug to validate the store
  // and attach req.storeId. The controller methods will use req.params.storeSlug
  // to pass to the service, as the service layer expects the slug.

  @Post('add')
  @UseGuards(StoreContextGuard) // JwtAuthGuard is optional here, handled by checking req.user
  @HttpCode(HttpStatus.CREATED)
  async addItemToCart(
    @Req() req: AuthenticatedRequest,
    @Body() addToCartDto: AddToCartDto,
    @Headers('x-guest-cart-id') guestCartIdHeader?: string
  ) {
    const userId = req.user?.id;
    const storeSlug: string = req.params.storeSlug; // Correctly get from route params
    let guestCartId = guestCartIdHeader;

    // storeSlug presence is validated by the guard now.

    if (!userId && !guestCartId) {
      guestCartId = uuidv4();
      this.logger.warn(`addItemToCart: No userId and no guestCartId provided. Generated new one: ${guestCartId} for store ${storeSlug}. This flow should be reviewed.`);
    }

    const cart = await this.cartService.addItem(storeSlug, addToCartDto, userId, guestCartId);
    if (!cart) {
      throw new NotFoundException('Cart not found or item could not be added.');
    }
    return cart;
  }

  @Get()
  @UseGuards(StoreContextGuard)
  async getCart(
    @Req() req: AuthenticatedRequest,
    @Headers('x-guest-cart-id') guestCartIdHeader?: string
  ) {
    const userId = req.user?.id;
    const storeSlug: string = req.params.storeSlug; // Correctly get from route params
    let guestCartId = guestCartIdHeader;

    // storeSlug presence is validated by the guard.

    this.logger.log(`CartController: getCart called. UserID: ${userId}, GuestCartID Header: ${guestCartIdHeader}, StoreSlug from params: ${storeSlug}`);

    let cart = await this.cartService.getCart(storeSlug, userId, guestCartId);

    if (!cart) {
      if (!userId) {
        const newGuestCartId = uuidv4();
        this.logger.log(`CartController: No cart found for guest. Generating new guestCartId: ${newGuestCartId} for store ${storeSlug}`);
        // Return a structure that CartService.loadInitialCart can understand for new guest carts
        return {
          id: null, // No persisted cart ID yet
          guestCartId: newGuestCartId, // The new ID for the frontend to store
          items: [],
          subtotal: 0,
          grandTotal: 0,
          discountAmount: 0,
          appliedPromoCode: null,
          store: { slug: storeSlug }, // Include store slug for context
          user: null, // No user for guest cart
          // Ensure all fields expected by Cart interface are present
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        // For logged-in users, if cartService.getCart returns null, it means no cart exists.
        // We could create one here, or let the service handle it.
        // For now, let's assume if a logged-in user has no cart, it's an issue or needs creation by service.
        // The service.addItem already creates a cart if one doesn't exist for a user.
        // So, for getCart, if it's null for a user, it means there's genuinely no cart.
        this.logger.warn(`CartController: No cart found for user ${userId} in store ${storeSlug}. Consider creating one if this is unexpected.`);
        throw new NotFoundException('Cart not found for this user and store.');
      }
    }
    return cart;
  }

  @Patch(':productId')
  @UseGuards(StoreContextGuard) // JwtAuthGuard is optional
  async updateItemQuantity(
    @Req() req: AuthenticatedRequest,
    @Param('productId') productId: string,
    @Body('quantity', ParseIntPipe) quantity: number,
    @Headers('x-guest-cart-id') guestCartIdHeader?: string
  ) {
    const userId = req.user?.id;
    const storeSlug: string = req.params.storeSlug; // Correctly get from route params
    const guestCartId = guestCartIdHeader;

    // storeSlug presence is validated by the guard.

    if (!userId && !guestCartId) {
      throw new BadRequestException('Cart identifier (userId or guestCartId) is missing.');
    }

    const updatedCart = await this.cartService.updateItemQuantity(storeSlug, productId, quantity, userId, guestCartId);
    if (!updatedCart) {
      throw new NotFoundException('Cart or item not found for update.');
    }
    return updatedCart;
  }

  @Delete(':productId')
  @UseGuards(StoreContextGuard) // JwtAuthGuard is optional
  @HttpCode(HttpStatus.OK)
  async removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('productId') productId: string,
    @Headers('x-guest-cart-id') guestCartIdHeader?: string
  ) {
    const userId = req.user?.id;
    const storeSlug: string = req.params.storeSlug; // Correctly get from route params
    const guestCartId = guestCartIdHeader;

    // storeSlug presence is validated by the guard.

    if (!userId && !guestCartId) {
      throw new BadRequestException('Cart identifier (userId or guestCartId) is missing.');
    }

    const updatedCart = await this.cartService.removeItem(storeSlug, productId, userId, guestCartId);
    if (!updatedCart) {
      throw new NotFoundException('Cart or item not found for removal.');
    }
    return updatedCart;
  }

  @Post('promo')
  @UseGuards(StoreContextGuard) // JwtAuthGuard is optional, but promo might be user-specific
  @HttpCode(HttpStatus.OK)
  async applyPromoCode(
    @Req() req: AuthenticatedRequest,
    @Body() applyPromoCodeDto: ApplyPromoCodeDto,
    @Headers('x-guest-cart-id') guestCartIdHeader?: string
  ) {
    const userId = req.user?.id;
    const contextStoreSlug: string = req.params.storeSlug; // Correctly get from route params
    const guestCartId = guestCartIdHeader;

    // storeSlug presence is validated by the guard.
    // applyPromoCodeDto.storeSlug might be redundant if contextStoreSlug is always used from param.
    // For now, service uses applyPromoCodeDto.storeSlug first, then contextStoreSlug.

    if (!userId && !guestCartId) {
      throw new BadRequestException('Cart identifier (userId or guestCartId) is missing for applying promo code.');
    }

    const result = await this.cartService.applyPromoCode(userId, applyPromoCodeDto, contextStoreSlug, guestCartId);

    if (result && typeof result === 'object' && 'error' in result && 'message' in result) {
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
      throw new NotFoundException('Cart not found or unable to apply promo code.');
    }

    return result;
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard, StoreContextGuard) // User must be logged in to merge. StoreContextGuard provides storeId.
  @HttpCode(HttpStatus.OK)
  async mergeGuestCart(
    @Req() req: AuthenticatedRequest,
    @Body() mergeCartDto: MergeCartDto,
  ) {
    const userId = req.user.id; // From JwtAuthGuard
    const storeId = req.storeId; // From StoreContextGuard
    const storeSlug = req.params.storeSlug; // For logging or if service needs it

    this.logger.log(`mergeGuestCart: User ${userId} attempting to merge guest cart ${mergeCartDto.guestCartId} for store slug ${storeSlug} (ID: ${storeId})`);

    if (!storeId) {
        this.logger.error(`mergeGuestCart: StoreId not found on request for slug ${storeSlug}. Guard issue?`);
        throw new BadRequestException('Store context could not be determined.');
    }

    const mergedCart = await this.cartService.mergeCarts(userId, storeId, mergeCartDto.guestCartId);
    if (!mergedCart) {
      // This could mean the user's cart couldn't be created/found, or guest cart was invalid.
      // The service should throw specific errors if needed.
      throw new BadRequestException('Failed to merge cart. Guest cart may be invalid or user cart inaccessible.');
    }
    return mergedCart;
  }
}
