import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto';

// Define a simple DTO for the expected payload
export interface AddToCartDto {
  productId: string;
  quantity: number;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(CartEntity)
    private cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private cartItemRepository: Repository<CartItemEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(StoreEntity)
    private storeRepository: Repository<StoreEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private promoCodesService: PromoCodesService,
  ) { }

  async addItem(userId: string, storeSlug: string, addToCartDto: AddToCartDto): Promise<CartEntity | null> {
    const { productId, quantity } = addToCartDto;
    this.logger.log(`Attempting to add item: ${productId}, Quantity: ${quantity} for user ${userId} in store ${storeSlug}`);

    if (!productId || quantity == null || quantity < 1) {
      throw new BadRequestException('Invalid product ID or quantity.');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const product = await this.productRepository.findOneBy({ id: productId, store: { id: store.id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found in store ${storeSlug}.`);
    }

    // Find or create the user's cart for this store
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId }, store: { id: store.id } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user, store, items: [] });
      await this.cartRepository.save(cart);
      this.logger.log(`Created new cart for user ${userId} in store ${storeSlug}.`);
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(item => item.product.id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      await this.cartItemRepository.save(existingItem);
      this.logger.log(`Updated quantity for item ${productId} in cart ${cart.id}. New quantity: ${existingItem.quantity}`);
    } else {
      const newItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
      });
      cart.items.push(newItem);
      await this.cartItemRepository.save(newItem);
      this.logger.log(`Added new item ${productId} to cart ${cart.id}.`);
    }

    // Reload the cart to ensure relations are updated
    cart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });

    return cart; // Return the updated cart entity
  }

  async getCart(userId: string, storeSlug: string): Promise<CartEntity | null> {
    this.logger.log(`Getting cart for user ${userId} in store ${storeSlug}`);

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId }, store: { id: store.id } },
      relations: ['items', 'items.product'],
    });

    return cart;
  }

  async updateItemQuantity(userId: string, storeSlug: string, productId: string, quantity: number): Promise<CartEntity | null> {
    this.logger.log(`Attempting to update quantity for ${productId} to ${quantity} for user ${userId} in store ${storeSlug}`);

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId }, store: { id: store.id } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found for this user and store.');
    }

    const existingItem = cart.items.find(item => item.product.id === productId);

    if (!existingItem) {
      throw new NotFoundException(`Item with product ID ${productId} not found in cart.`);
    }

    if (quantity < 1) {
      this.logger.log(`Removing item ${productId} from cart ${cart.id} due to quantity zero.`);
      await this.cartItemRepository.remove(existingItem);
      // Remove the item from the cart's items array in memory
      cart.items = cart.items.filter(item => item.id !== existingItem.id);
    } else {
      existingItem.quantity = quantity;
      await this.cartItemRepository.save(existingItem);
      this.logger.log(`Quantity updated for item ${productId} in cart ${cart.id}. New quantity: ${existingItem.quantity}`);
    }

    // Reload the cart to ensure relations are updated if an item was removed
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });


    return updatedCart;
  }

  async removeItem(userId: string, storeSlug: string, productId: string): Promise<CartEntity | null> {
    this.logger.log(`Attempting to remove item ${productId} for user ${userId} in store ${storeSlug}`);

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId }, store: { id: store.id } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found for this user and store.');
    }

    const existingItem = cart.items.find(item => item.product.id === productId);

    if (!existingItem) {
      throw new NotFoundException(`Item with product ID ${productId} not found in cart.`);
    }

    await this.cartItemRepository.remove(existingItem);
    this.logger.log(`Item ${productId} removed from cart ${cart.id}.`);

    // Remove the item from the cart's items array in memory
    cart.items = cart.items.filter(item => item.id !== existingItem.id);

    // Reload the cart to ensure relations are updated
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });

    return updatedCart;
  }


  async applyPromoCode(
    userId: string,
    applyPromoCodeDto: ApplyPromoCodeDto,
    contextStoreSlug?: string, // storeSlug from the guard context
  ): Promise<CartEntity | { error: string; message: string }> {
    this.logger.log(`Attempting to apply promo code "${applyPromoCodeDto.promoCode}" for user ${userId}. DTO storeSlug: ${applyPromoCodeDto.storeSlug}, Context storeSlug: ${contextStoreSlug}`);

    // Determine the effective storeSlug to use for fetching the cart and promo validation
    const effectiveStoreSlug = applyPromoCodeDto.storeSlug || contextStoreSlug;
    if (!effectiveStoreSlug) {
      this.logger.warn(`No store context available for applying promo code for user ${userId}`);
      return { error: 'STORE_CONTEXT_MISSING', message: 'Store context is required to apply a promo code.' };
    }

    const cart = await this.getCart(userId, effectiveStoreSlug);
    if (!cart) {
      this.logger.warn(`Cart not found for user ${userId} in store ${effectiveStoreSlug}`);
      return { error: 'CART_NOT_FOUND', message: 'Cart not found.' };
    }

    const promoCodeEntity = await this.promoCodesService.findByCode(applyPromoCodeDto.promoCode);

    if (!promoCodeEntity) {
      this.logger.warn(`Promo code "${applyPromoCodeDto.promoCode}" not found.`);
      return { error: 'PROMO_CODE_NOT_FOUND', message: 'Promo code not found.' };
    }

    if (!promoCodeEntity.isActive) {
      this.logger.warn(`Promo code "${applyPromoCodeDto.promoCode}" is inactive.`);
      return { error: 'PROMO_CODE_INACTIVE', message: 'This promo code is no longer active.' };
    }

    const now = new Date();
    if (promoCodeEntity.validFrom && promoCodeEntity.validFrom > now) {
      this.logger.warn(`Promo code "${applyPromoCodeDto.promoCode}" is not yet valid.`);
      return { error: 'PROMO_CODE_NOT_YET_VALID', message: 'This promo code is not active yet.' };
    }
    if (promoCodeEntity.validTo && promoCodeEntity.validTo < now) {
      this.logger.warn(`Promo code "${applyPromoCodeDto.promoCode}" has expired.`);
      return { error: 'PROMO_CODE_EXPIRED', message: 'This promo code has expired.' };
    }

    // Store Specificity Check
    if (promoCodeEntity.storeId) {
      const store = await this.storeRepository.findOneBy({ slug: effectiveStoreSlug });
      if (!store || store.id !== promoCodeEntity.storeId) {
        this.logger.warn(`Promo code "${applyPromoCodeDto.promoCode}" is not valid for store ${effectiveStoreSlug}. Expected store ID: ${promoCodeEntity.storeId}, Actual store ID: ${store?.id}`);
        return { error: 'STORE_MISMATCH', message: 'This promo code is not valid for this store.' };
      }
    }

    // Calculate cart subtotal (sum of item.product.price * item.quantity)
    // This assumes cart.items and cart.items.product are loaded. getCart already does this.
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    if (promoCodeEntity.minCartValue && subtotal < promoCodeEntity.minCartValue) {
      this.logger.warn(`Cart subtotal ${subtotal} is less than minimum required ${promoCodeEntity.minCartValue} for promo code "${applyPromoCodeDto.promoCode}".`);
      return { error: 'MIN_CART_VALUE_NOT_MET', message: `A minimum cart value of $${promoCodeEntity.minCartValue.toFixed(2)} is required for this promo code.` };
    }

    // Apply Discount
    let discountAmount = 0;
    if (promoCodeEntity.discountType === 'percentage') {
      discountAmount = subtotal * (promoCodeEntity.discountValue / 100);
    } else if (promoCodeEntity.discountType === 'fixed') {
      discountAmount = promoCodeEntity.discountValue;
    }
    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    // Update CartEntity (These fields need to be added to CartEntity)
    cart.appliedPromoCode = promoCodeEntity.code;
    cart.discountAmount = parseFloat(discountAmount.toFixed(2)); // Ensure two decimal places

    // Recalculate grandTotal (subtotal - discountAmount for now)
    // Later: subtotal - discountAmount + taxes + shipping
    cart.grandTotal = parseFloat((subtotal - cart.discountAmount).toFixed(2));

    // For now, let's assume subtotal is the primary component for grand total before discount
    cart.subtotal = parseFloat(subtotal.toFixed(2)); // Ensure subtotal is also set if not already

    await this.cartRepository.save(cart);
    this.logger.log(`Promo code "${applyPromoCodeDto.promoCode}" applied successfully to cart ${cart.id}. Discount: ${cart.discountAmount}, New Grand Total: ${cart.grandTotal}`);

    return cart;
  }

  async clearCart(userId: string, storeId: string, transactionManager?: import('typeorm').EntityManager): Promise<void> {
    this.logger.log(`Attempting to clear cart for user ${userId} in store ${storeId}`);

    const repository = transactionManager ? transactionManager.getRepository(CartEntity) : this.cartRepository;
    const itemRepository = transactionManager ? transactionManager.getRepository(CartItemEntity) : this.cartItemRepository;

    const cart = await repository.findOne({
      where: { user: { id: userId }, store: { id: storeId } },
      relations: ['items'], // Load items to delete them
    });

    if (cart) {
      if (cart.items && cart.items.length > 0) {
        // Delete all cart items associated with the cart
        // This needs to be done carefully if using a transaction manager
        // For simplicity, we'll remove them one by one if using transactionManager,
        // or use a bulk delete if not.
        // However, TypeORM's cascade options on CartEntity might handle this.
        // Let's assume cascade delete is set up for items when a cart is deleted.
        // Or, more explicitly:
        await itemRepository.remove(cart.items);
        this.logger.log(`Removed ${cart.items.length} items from cart ${cart.id}`);
      }
      // After items are cleared (or if cascade delete is reliable), delete the cart itself.
      await repository.remove(cart);
      this.logger.log(`Cart ${cart.id} for user ${userId} in store ${storeId} has been cleared.`);
    } else {
      this.logger.log(`No cart found for user ${userId} in store ${storeId} to clear.`);
    }
  }
}
