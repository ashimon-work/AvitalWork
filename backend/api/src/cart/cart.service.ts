import { Injectable, Logger } from '@nestjs/common';

// Define a simple DTO for the expected payload
export interface AddToCartDto {
  productId: string;
  quantity: number;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  // In-memory cart for demonstration (replace with database later)
  private cart: { [productId: string]: number } = {};

  async addItem(addToCartDto: AddToCartDto): Promise<{ success: boolean; message: string; cart: any }> {
    const { productId, quantity } = addToCartDto;
    this.logger.log(`Attempting to add item: ${productId}, Quantity: ${quantity}`);

    if (!productId || quantity == null || quantity < 1) {
      this.logger.warn(`Invalid payload received: ${JSON.stringify(addToCartDto)}`);
      return { success: false, message: 'Invalid product ID or quantity.', cart: this.cart };
    }

    // Basic validation/logic (replace with real checks later)
    // For now, just add/update quantity in the in-memory cart
    this.cart[productId] = (this.cart[productId] || 0) + quantity;

    this.logger.log(`Item added/updated. Current cart: ${JSON.stringify(this.cart)}`);

    // Return a success response (adjust return type as needed by frontend)
    return { success: true, message: 'Item added to cart.', cart: this.cart };
  }

  async getCart(): Promise<{ cart: any }> {
    this.logger.log(`Getting current cart: ${JSON.stringify(this.cart)}`);
    // In a real app, fetch from DB based on user session/ID
    return { cart: this.cart };
  }

  async updateItemQuantity(productId: string, quantity: number): Promise<{ success: boolean; message: string; cart: any }> {
    this.logger.log(`Attempting to update quantity for ${productId} to ${quantity}`);
    if (quantity < 1) {
      this.logger.warn(`Invalid quantity ${quantity}, removing item ${productId}`);
      delete this.cart[productId];
      return { success: true, message: 'Item removed due to quantity zero.', cart: this.cart };
    }
    if (!this.cart[productId]) {
       this.logger.warn(`Item ${productId} not found in cart for update.`);
       return { success: false, message: 'Item not found in cart.', cart: this.cart };
    }
    this.cart[productId] = quantity;
    this.logger.log(`Quantity updated. Current cart: ${JSON.stringify(this.cart)}`);
    return { success: true, message: 'Cart updated.', cart: this.cart };
  }

   async removeItem(productId: string): Promise<{ success: boolean; message: string; cart: any }> {
     this.logger.log(`Attempting to remove item ${productId}`);
     if (!this.cart[productId]) {
       this.logger.warn(`Item ${productId} not found in cart for removal.`);
       return { success: false, message: 'Item not found in cart.', cart: this.cart };
     }
     delete this.cart[productId];
     this.logger.log(`Item removed. Current cart: ${JSON.stringify(this.cart)}`);
     return { success: true, message: 'Item removed from cart.', cart: this.cart };
   }
}
