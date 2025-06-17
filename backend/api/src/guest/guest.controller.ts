import { Controller, Get, Headers, Logger } from '@nestjs/common';
import { CartService } from '../cart/cart.service';

@Controller('guest')
export class GuestController {
  private readonly logger = new Logger(GuestController.name);

  constructor(private readonly cartService: CartService) {}

  @Get('carts')
  async getGuestCarts(@Headers('x-guest-cart-id') guestCartId?: string) {
    this.logger.log(`Getting carts for guest ${guestCartId}`);
    if (!guestCartId) {
      return [];
    }
    return this.cartService.findAllByUserIdOrGuestId(undefined, guestCartId);
  }
}