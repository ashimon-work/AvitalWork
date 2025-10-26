import { Controller, Get, Headers, Logger } from '@nestjs/common';
import { CartService } from '../cart/cart.service';

@Controller('guest')
export class GuestController {
  private readonly logger = new Logger(GuestController.name);

  constructor(private readonly cartService: CartService) {}

  @Get('carts')
  async getGuestCarts(@Headers('x-guest-session-id') guestSessionId?: string) {
    this.logger.log(`Getting carts for guest ${guestSessionId}`);
    if (!guestSessionId) {
      return [];
    }
    return this.cartService.findAllByUserIdOrGuestSessionId(
      undefined,
      guestSessionId,
    );
  }
}
