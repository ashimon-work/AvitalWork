import { Controller, Post, Body, HttpCode, HttpStatus, Get, Patch, Delete, Param, ParseIntPipe, Req, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common'; // Added Get, Patch, Delete, Param, ParseIntPipe, Req, UseGuards, NotFoundException, BadRequestException
import { CartService, AddToCartDto } from './cart.service'; // Import service and DTO
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import JwtAuthGuard
import { StoreContextGuard } from '../core/guards/store-context.guard'; // Import StoreContextGuard
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface'; // Import AuthenticatedRequest
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto'; // Import ApplyPromoCodeDto

@UseGuards(JwtAuthGuard, StoreContextGuard) // Protect all routes in this controller
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {} // Inject service

  @Post('add') // Handle POST /cart/add
  @HttpCode(HttpStatus.OK) // Return 200 OK on success by default for POST if needed
  async addItemToCart(@Req() req: AuthenticatedRequest, @Body() addToCartDto: AddToCartDto) {
    // TODO: Add validation pipe later for addToCartDto
    const userId = req.user.id; // User ID is available on req.user
    const storeSlug = req.storeSlug; // storeSlug is added by StoreContextGuard

    if (!storeSlug) {
      throw new BadRequestException('Store context is missing.');
    }

    const cart = await this.cartService.addItem(userId, storeSlug, addToCartDto);
    if (!cart) {
      throw new NotFoundException('Cart not found after adding item.');
    }
    return cart;
  }

  @Get() // Handle GET /cart
  async getCart(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;

    if (!storeSlug) {
      throw new BadRequestException('Store context is missing.');
    }

    const cart = await this.cartService.getCart(userId, storeSlug);
    if (!cart) {
       // Return an empty cart or 404 depending on desired behavior for no cart
       // For now, let's return 404 if no cart exists for the user/store
       throw new NotFoundException('Cart not found for this user and store.');
    }
    return cart;
  }

  @Patch(':productId') // Handle PATCH /cart/:productId
  async updateItemQuantity(
    @Req() req: AuthenticatedRequest,
    @Param('productId') productId: string,
    @Body('quantity', ParseIntPipe) quantity: number, // Use ParseIntPipe for validation
  ) {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;

    if (!storeSlug) {
      throw new BadRequestException('Store context is missing.');
    }

    const updatedCart = await this.cartService.updateItemQuantity(userId, storeSlug, productId, quantity);
     if (!updatedCart) {
       throw new NotFoundException('Cart or item not found for update.');
     }
    return updatedCart;
  }

  @Delete(':productId') // Handle DELETE /cart/:productId
  @HttpCode(HttpStatus.OK) // Or 204 No Content if preferred
  async removeItem(@Req() req: AuthenticatedRequest, @Param('productId') productId: string) {
    const userId = req.user.id;
    const storeSlug = req.storeSlug;

    if (!storeSlug) {
      throw new BadRequestException('Store context is missing.');
    }

    const updatedCart = await this.cartService.removeItem(userId, storeSlug, productId);
     if (!updatedCart) {
       throw new NotFoundException('Cart or item not found for removal.');
     }
    return updatedCart;
  }

  @Post('promo') // Handle POST /cart/promo
  @HttpCode(HttpStatus.OK)
  async applyPromoCode(@Req() req: AuthenticatedRequest, @Body() applyPromoCodeDto: ApplyPromoCodeDto) {
    const userId = req.user.id; // Define userId once
    const contextStoreSlug = req.storeSlug;

    // The service's applyPromoCode method will be updated to accept:
    // (userId: string, applyPromoCodeDto: ApplyPromoCodeDto, contextStoreSlug?: string)
    // It will then use applyPromoCodeDto.promoCode and applyPromoCodeDto.storeSlug (if present),
    // or fall back to contextStoreSlug for store-specific logic.
    const result = await this.cartService.applyPromoCode(userId, applyPromoCodeDto, contextStoreSlug);
    
    if (result && typeof result === 'object' && 'error' in result && 'message' in result) {
      // Explicitly cast to the error structure after checking properties
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
      throw new BadRequestException('Failed to apply promo code.'); // Generic fallback
    } else if (!result) {
        throw new NotFoundException('Cart not found or unable to apply promo code.');
    }
    
    return result; // This is the CartEntity
  }
} // This closes the CartController class
