import { Controller, Post, Body, HttpCode, HttpStatus, Get, Patch, Delete, Param, ParseIntPipe } from '@nestjs/common'; // Added Get, Patch, Delete, Param, ParseIntPipe
import { CartService, AddToCartDto } from './cart.service'; // Import service and DTO

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {} // Inject service

  @Post('add') // Handle POST /cart/add
  @HttpCode(HttpStatus.OK) // Return 200 OK on success by default for POST if needed
  async addItemToCart(@Body() addToCartDto: AddToCartDto) {
    // TODO: Add validation pipe later for addToCartDto
    return this.cartService.addItem(addToCartDto);
  }

  @Get()
  async getCart() {
    // TODO: Associate cart with user later
    return this.cartService.getCart();
  }

  @Patch(':productId') // Handle PATCH /cart/:productId
  async updateItemQuantity(
    @Param('productId') productId: string,
    @Body('quantity', ParseIntPipe) quantity: number, // Use ParseIntPipe for validation
  ) {
    return this.cartService.updateItemQuantity(productId, quantity);
  }

  @Delete(':productId') // Handle DELETE /cart/:productId
  @HttpCode(HttpStatus.OK) // Or 204 No Content if preferred
  async removeItem(@Param('productId') productId: string) {
    return this.cartService.removeItem(productId);
  }
}
