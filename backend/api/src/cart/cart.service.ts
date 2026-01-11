import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto';

import { v4 as uuidv4 } from 'uuid';
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
  ) {}

  async addItem(
    storeSlug: string,
    addToCartDto: AddToCartDto,
    userId?: string,
    guestSessionId?: string,
  ): Promise<CartEntity[] | null> {
    const { productId, quantity } = addToCartDto;
    this.logger.log(
      `Attempting to add item: ${productId}, Quantity: ${quantity} for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}) in store ${storeSlug}`,
    );

    if (!productId || quantity == null || quantity < 1) {
      throw new BadRequestException('Invalid product ID or quantity.');
    }

    if (!userId && !guestSessionId) {
      guestSessionId = uuidv4();
    }

    let user: UserEntity | null = null;
    if (userId) {
      user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('User not found.');
      }
    }

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const product = await this.productRepository.findOne({
      where: { id: productId, store: { id: store.id } },
      relations: ['store'],
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${productId} not found in store ${storeSlug}.`,
      );
    }

    let cart: CartEntity | null = null;
    const relations = ['items', 'items.product', 'user', 'store'];

    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { user: { id: userId }, store: { id: store.id } },
        relations,
      });
      if (!cart) {
        cart = this.cartRepository.create({
          user: user || undefined,
          store,
          items: [],
        }); // Use user if available, else undefined
        await this.cartRepository.save(cart);
        this.logger.log(
          `Created new cart ${cart.id} for user ${userId} in store ${storeSlug}.`,
        );
      }
    } else if (guestSessionId) {
      cart = await this.cartRepository.findOne({
        where: { guest_session_id: guestSessionId, store: { id: store.id } },
        relations, // user will be null here
      });
      if (!cart) {
        // If the frontend sent a guestSessionId, it expects us to use it or create a cart with it.
        cart = this.cartRepository.create({
          guest_session_id: guestSessionId,
          store,
          items: [],
          user: undefined,
        }); // Explicitly undefined user for guest
        await this.cartRepository.save(cart);
        this.logger.log(
          `Created new cart ${cart.id} for guestSessionId ${guestSessionId} in store ${storeSlug}.`,
        );
      }
    }

    if (!cart) {
      // This case should ideally not be reached if logic above is correct
      this.logger.error(
        `Cart could not be found or created for user ${userId}/guest ${guestSessionId}`,
      );
      throw new NotFoundException('Cart could not be established.');
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(
      (item) => item.product.id === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      await this.cartItemRepository.save(existingItem);
      this.logger.log(
        `Updated quantity for item ${productId} in cart ${cart.id}. New quantity: ${existingItem.quantity}`,
      );
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

    if (userId) {
      return this.findAllByUserIdOrGuestSessionId(userId);
    } else if (guestSessionId) {
      return this.findAllByUserIdOrGuestSessionId(undefined, guestSessionId);
    }
    return null; // Should not happen due to checks above
  }

  async getCart(
    storeSlug: string,
    userId?: string,
    guestSessionId?: string,
  ): Promise<CartEntity | null> {
    this.logger.log(
      `Getting cart for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}) in store ${storeSlug}`,
    );

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      this.logger.warn(`Store not found with slug: ${storeSlug}`);
      throw new NotFoundException('Store not found.');
    }

    let cart: CartEntity | null = null;
    const relations = ['items', 'items.product', 'user', 'store'];

    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { user: { id: userId }, store: { id: store.id } },
        relations: relations,
      });
      if (cart) this.logger.log(`Found cart ${cart.id} for user ${userId}`);
    } else if (guestSessionId) {
      cart = await this.cartRepository.findOne({
        where: { guest_session_id: guestSessionId, store: { id: store.id } },
        relations: relations, // user will be null here if it's a guest cart
      });
      if (cart)
        this.logger.log(
          `Found cart ${cart.id} for guestSessionId ${guestSessionId}`,
        );
    }

    // If no cart is found for a guest, and a guestSessionId was provided,
    // it implies the guestSessionId is invalid or the cart was cleared.
    // If no cart is found for a guest and NO guestSessionId was provided,
    // the controller/frontend might decide to generate a new guestSessionId.
    // For now, this service will return null if no cart is actively found.
    // A more advanced implementation might create a new guest cart here if guestSessionId is new.

    if (!cart) {
      this.logger.log(
        `No cart found for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}) in store ${storeSlug}`,
      );
    }
    return cart;
  }

  async updateItemQuantity(
    storeSlug: string,
    cartItemId: string,
    quantity: number,
    userId?: string,
    guestSessionId?: string,
  ): Promise<CartEntity | null> {
    this.logger.log(
      `Attempting to update quantity for ${cartItemId} to ${quantity} for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}) in store ${storeSlug}`,
    );

    if (!userId && !guestSessionId) {
      throw new BadRequestException(
        'Either userId or guestSessionId must be provided for updateItemQuantity.',
      );
    }

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    let cart: CartEntity | null = null;
    const relations = ['items', 'items.product', 'user', 'store'];

    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { user: { id: userId }, store: { id: store.id } },
        relations,
      });
    } else if (guestSessionId) {
      cart = await this.cartRepository.findOne({
        where: { guest_session_id: guestSessionId, store: { id: store.id } },
        relations,
      });
    }

    if (!cart) {
      throw new NotFoundException(
        `Cart not found for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}) in store ${storeSlug}.`,
      );
    }

    const existingItem = cart.items.find(
      (item) => item.id === cartItemId,
    );

    if (!existingItem) {
      throw new NotFoundException(
        `Item with cart item ID ${cartItemId} not found in cart.`
      );
    }

    if (quantity < 1) {
      this.logger.log(
        `Removing item ${cartItemId} from cart ${cart.id} due to quantity zero.`,
      );
      await this.cartItemRepository.remove(existingItem);
      // Remove the item from the cart's items array in memory
      cart.items = cart.items.filter((item) => item.id !== existingItem.id);
    } else {
      existingItem.quantity = quantity;
      await this.cartItemRepository.save(existingItem);
      this.logger.log(
        `Quantity updated for item ${cartItemId} in cart ${cart.id}. New quantity: ${existingItem.quantity}`,
      );
    }

    // Reload the cart to ensure relations are updated if an item was removed
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });

    return updatedCart;
  }

  async removeItem(
    storeSlug: string,
    cartItemId: string,
    userId?: string,
    guestSessionId?: string,
  ): Promise<CartEntity | null> {
    this.logger.log(
      `Attempting to remove item ${cartItemId} for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}) in store ${storeSlug}`,
    );

    if (!userId && !guestSessionId) {
      throw new BadRequestException(
        'Either userId or guestSessionId must be provided for removeItem.',
      );
    }

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    let cart: CartEntity | null = null;
    const relations = ['items', 'items.product', 'user', 'store'];

    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { user: { id: userId }, store: { id: store.id } },
        relations,
      });
    } else if (guestSessionId) {
      cart = await this.cartRepository.findOne({
        where: { guest_session_id: guestSessionId, store: { id: store.id } },
        relations,
      });
    }

    if (!cart) {
      throw new NotFoundException(
        `Cart not found for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}) in store ${storeSlug}.`,
      );
    }

    const existingItem = cart.items.find(
      (item) => item.id === cartItemId,
    );

    if (!existingItem) {
      throw new NotFoundException(
        `Item with cart item ID ${cartItemId} not found in cart.`,
      );
    }

    await this.cartItemRepository.remove(existingItem);
    this.logger.log(`Item ${cartItemId} removed from cart ${cart.id}.`);

    // Remove the item from the cart's items array in memory
    cart.items = cart.items.filter((item) => item.id !== existingItem.id);

    // Reload the cart to ensure relations are updated
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });

    return updatedCart;
  }

  async applyPromoCode(
    userId: string | undefined, // Can be undefined for guest
    applyPromoCodeDto: ApplyPromoCodeDto,
    contextStoreSlug?: string,
    guestSessionId?: string, // Added for guest cart promo application
  ): Promise<CartEntity | { error: string; message: string }> {
    this.logger.log(
      `Attempting to apply promo code "${applyPromoCodeDto.promoCode}" for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}). DTO storeSlug: ${applyPromoCodeDto.storeSlug}, Context storeSlug: ${contextStoreSlug}`,
    );

    const effectiveStoreSlug = applyPromoCodeDto.storeSlug || contextStoreSlug;
    if (!effectiveStoreSlug) {
      this.logger.warn(
        `No store context available for applying promo code for user ${userId || 'guest'}`,
      );
      return {
        error: 'STORE_CONTEXT_MISSING',
        message: 'Store context is required to apply a promo code.',
      };
    }

    if (!userId && !guestSessionId) {
      throw new BadRequestException(
        'Either userId or guestSessionId must be provided for applyPromoCode.',
      );
    }

    // Use the modified getCart which handles userId or guestSessionId
    const cart = await this.getCart(effectiveStoreSlug, userId, guestSessionId);
    if (!cart) {
      this.logger.warn(
        `Cart not found for user ${userId || 'guest'} (guestSessionId: ${guestSessionId}) in store ${effectiveStoreSlug}`,
      );
      return { error: 'CART_NOT_FOUND', message: 'Cart not found.' };
    }

    const promoCodeEntity = await this.promoCodesService.findByCode(
      applyPromoCodeDto.promoCode,
    );

    if (!promoCodeEntity) {
      this.logger.warn(
        `Promo code "${applyPromoCodeDto.promoCode}" not found.`,
      );
      return {
        error: 'PROMO_CODE_NOT_FOUND',
        message: 'Promo code not found.',
      };
    }

    if (!promoCodeEntity.isActive) {
      this.logger.warn(
        `Promo code "${applyPromoCodeDto.promoCode}" is inactive.`,
      );
      return {
        error: 'PROMO_CODE_INACTIVE',
        message: 'This promo code is no longer active.',
      };
    }

    const now = new Date();
    if (promoCodeEntity.validFrom && promoCodeEntity.validFrom > now) {
      this.logger.warn(
        `Promo code "${applyPromoCodeDto.promoCode}" is not yet valid.`,
      );
      return {
        error: 'PROMO_CODE_NOT_YET_VALID',
        message: 'This promo code is not active yet.',
      };
    }
    if (promoCodeEntity.validTo && promoCodeEntity.validTo < now) {
      this.logger.warn(
        `Promo code "${applyPromoCodeDto.promoCode}" has expired.`,
      );
      return {
        error: 'PROMO_CODE_EXPIRED',
        message: 'This promo code has expired.',
      };
    }

    // Store Specificity Check
    if (promoCodeEntity.storeId) {
      const store = await this.storeRepository.findOneBy({
        slug: effectiveStoreSlug,
      });
      if (!store || store.id !== promoCodeEntity.storeId) {
        this.logger.warn(
          `Promo code "${applyPromoCodeDto.promoCode}" is not valid for store ${effectiveStoreSlug}. Expected store ID: ${promoCodeEntity.storeId}, Actual store ID: ${store?.id}`,
        );
        return {
          error: 'STORE_MISMATCH',
          message: 'This promo code is not valid for this store.',
        };
      }
    }

    // Calculate cart subtotal (sum of item.product.price * item.quantity)
    // This assumes cart.items and cart.items.product are loaded. getCart already does this.
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    if (
      promoCodeEntity.minCartValue &&
      subtotal < promoCodeEntity.minCartValue
    ) {
      this.logger.warn(
        `Cart subtotal ${subtotal} is less than minimum required ${promoCodeEntity.minCartValue} for promo code "${applyPromoCodeDto.promoCode}".`,
      );
      return {
        error: 'MIN_CART_VALUE_NOT_MET',
        message: `A minimum cart value of $${promoCodeEntity.minCartValue.toFixed(2)} is required for this promo code.`,
      };
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
    this.logger.log(
      `Promo code "${applyPromoCodeDto.promoCode}" applied successfully to cart ${cart.id}. Discount: ${cart.discountAmount}, New Grand Total: ${cart.grandTotal}`,
    );

    return cart;
  }

  async clearCart(
    userId: string,
    storeId: string,
    transactionManager?: import('typeorm').EntityManager,
  ): Promise<void> {
    this.logger.log(
      `Attempting to clear cart for user ${userId} in store ${storeId}`,
    );

    const repository = transactionManager
      ? transactionManager.getRepository(CartEntity)
      : this.cartRepository;
    const itemRepository = transactionManager
      ? transactionManager.getRepository(CartItemEntity)
      : this.cartItemRepository;

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
        this.logger.log(
          `Removed ${cart.items.length} items from cart ${cart.id}`,
        );
      }
      // After items are cleared (or if cascade delete is reliable), delete the cart itself.
      await repository.remove(cart);
      this.logger.log(
        `Cart ${cart.id} for user ${userId} in store ${storeId} has been cleared.`,
      );
    } else {
      this.logger.log(
        `No cart found for user ${userId} in store ${storeId} to clear.`,
      );
    }
  }

  async mergeCarts(
    userId: string,
    storeId: string,
    storeSlug: string,
    guestCartId: string,
  ): Promise<CartEntity | null> {
    this.logger.log(
      `Attempting to merge guest cart ${guestCartId} into user ${userId}'s cart for store ${storeId}`,
    );

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      this.logger.error(`mergeCarts: User ${userId} not found.`);
      throw new NotFoundException('User not found.');
    }

    const store = await this.storeRepository.findOneBy({ id: storeId });
    if (!store) {
      this.logger.error(`mergeCarts: Store ${storeId} not found.`);
      throw new NotFoundException('Store not found.');
    }

    let guestCart = await this.cartRepository.findOne({
      where: { guest_session_id: guestCartId, store: { slug: storeSlug } },
      relations: ['items', 'items.product', 'store'], // Load guest cart items and their products
    });

    // Ensure user has a cart, or create one.
    // We can leverage parts of the addItem logic or getCart to establish the user's cart.
    let userCart = await this.cartRepository.findOne({
      where: { user: { id: userId }, store: { id: storeId } },
      relations: ['items', 'items.product', 'user', 'store'],
    });

    if (!userCart) {
      userCart = this.cartRepository.create({ user, store, items: [] });
      await this.cartRepository.save(userCart);
      this.logger.log(
        `mergeCarts: Created new cart ${userCart.id} for user ${userId} in store ${storeId}.`,
      );
    }

    if (guestCart && guestCart.items && guestCart.items.length > 0) {
      this.logger.log(
        `mergeCarts: Guest cart ${guestCart.id} has ${guestCart.items.length} items to merge.`,
      );
      for (const guestItem of guestCart.items) {
        if (!guestItem.product) {
          this.logger.warn(
            `mergeCarts: Guest item ${guestItem.id} is missing product data. Skipping.`,
          );
          continue;
        }
        // Use the existing addItem logic to handle adding/updating quantity in user's cart
        // The addItem method will find/create userCart and add/update item quantity.
        // We pass userId directly, so addItem knows it's for the user, not a guest.
        // The storeSlug is needed by addItem.
        this.logger.log(
          `mergeCarts: Merging item ${guestItem.product.id} (qty: ${guestItem.quantity}) from guest cart ${guestCart.id} to user ${userId}'s cart.`,
        );
        await this.addItem(
          store.slug,
          { productId: guestItem.product.id, quantity: guestItem.quantity },
          userId,
          undefined,
        );
      }

      // After merging, delete the guest cart and its items
      this.logger.log(
        `mergeCarts: Deleting guest cart ${guestCart.id} and its items.`,
      );
      await this.cartItemRepository.remove(guestCart.items);
      await this.cartRepository.remove(guestCart);
      this.logger.log(`mergeCarts: Guest cart ${guestCart.id} deleted.`);
    } else {
      this.logger.log(
        `mergeCarts: No guest cart found with ID ${guestCartId} for store ${storeId}, or guest cart is empty. Nothing to merge.`,
      );
    }

    // Reload the user's cart to get the final state with all relations
    const finalUserCart = await this.cartRepository.findOne({
      where: { id: userCart.id },
      relations: ['items', 'items.product', 'user', 'store'],
    });

    return finalUserCart;
  }

  async findAllByUserIdOrGuestSessionId(
    userId?: string,
    guestSessionId?: string,
  ): Promise<CartEntity[]> {
    const whereCondition: any = {};
    if (userId) {
      this.logger.log(`Finding all carts for user ${userId}`);
      whereCondition.user = { id: userId };
    } else if (guestSessionId) {
      this.logger.log(`Finding all carts for guest ${guestSessionId}`);
      whereCondition.guest_session_id = guestSessionId;
    } else {
      return [];
    }

    return this.cartRepository.find({
      where: whereCondition,
      relations: ['store', 'items', 'items.product', 'items.product.store'],
    });
  }
}
