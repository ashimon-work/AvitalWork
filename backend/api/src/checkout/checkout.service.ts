import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial } from 'typeorm';
import { OrderEntity, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import { OrderItemEntity } from '../orders/entities/order-item.entity';
import { CartEntity } from '../cart/entities/cart.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { AddressEntity } from '../addresses/entities/address.entity';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { CartItemEntity } from '../cart/entities/cart-item.entity';
import { TaxEstimateQueryDto } from './dto/tax-estimate.dto';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(CartEntity)
    private cartRepository: Repository<CartEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(AddressEntity)
    private addressRepository: Repository<AddressEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(StoreEntity)
    private storeRepository: Repository<StoreEntity>,
    private dataSource: DataSource,
  ) {}

  // Placeholder method for GET /api/shipping/methods
  async getShippingMethods(storeSlug: string): Promise<any[]> {
    this.logger.log(`Fetching shipping methods for store ${storeSlug}`);
    // TODO: Implement actual logic to fetch shipping methods (e.g., from DB or external service)
    // For now, return a predefined list
    return [
      { id: 'standard', name: 'Standard Shipping', cost: 5.00 },
      { id: 'express', name: 'Express Shipping', cost: 10.00 },
    ];
  }

  // Placeholder method for GET /api/tax/estimate
  async getTaxEstimate(storeSlug: string, query: TaxEstimateQueryDto): Promise<{ estimatedTax: number }> {
    this.logger.log(`Estimating tax for store ${storeSlug} with query ${JSON.stringify(query)}`);

    const { state, cartSubtotal } = query;
    let taxRate = 0.05; // Default 5%

    if (state) {
      switch (state.toUpperCase()) {
        case 'CA':
        case 'CALIFORNIA':
          taxRate = 0.0725; // California 7.25%
          break;
        case 'NY':
        case 'NEW YORK':
          taxRate = 0.04; // New York 4%
          break;
        // Add more states as needed
        default:
          taxRate = 0.05; // Default for other states
      }
    }

    const estimatedTax = cartSubtotal * taxRate;
    return { estimatedTax };
  }

  // Method for POST /api/orders
  async processOrder(userId: string, storeSlug: string, createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Processing order for user ${userId} in store ${storeSlug}`);

      const user = await queryRunner.manager.findOneBy(UserEntity, { id: userId });
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const store = await queryRunner.manager.findOneBy(StoreEntity, { slug: storeSlug });
      if (!store) {
        throw new NotFoundException('Store not found.');
      }

      // Fetch the user's cart for this store
      const cart = await queryRunner.manager.findOne(CartEntity, {
        where: { user: { id: userId }, store: { id: store.id } },
        relations: ['items', 'items.product'],
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty.');
      }

      // Validate shipping address
      const shippingAddress = await queryRunner.manager.findOneBy(AddressEntity, { id: createOrderDto.shippingAddressId, user: { id: userId } });
      if (!shippingAddress) {
        throw new BadRequestException('Invalid shipping address.');
      }

      // TODO: Validate payment method (placeholder for now)
      // if (!createOrderDto.paymentMethodId) {
      //   throw new BadRequestException('Payment method is required.');
      // }

      // Calculate order totals (subtotal, shipping, tax, total)
      let subtotal = 0;
      for (const item of cart.items) {
        subtotal += item.product.price * item.quantity;
        // TODO: Check product stock and potentially update inventory here
        // if (item.product.stockLevel < item.quantity) {
        //   throw new BadRequestException(`Insufficient stock for product ${item.product.name}`);
        // }
        // item.product.stockLevel -= item.quantity;
        // await queryRunner.manager.save(ProductEntity, item.product);
      }

      // Placeholder shipping cost and tax calculation
      const shippingCost = createOrderDto.shippingMethod === 'standard' ? 5.00 : 10.00;
      const taxRate = 0.08;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + shippingCost + taxAmount;

      // Create the order entity
      const order = this.orderRepository.create({
        orderReference: `ORDER-${Date.now()}-${userId.substring(0, 4)}`, // Simple unique reference
        orderDate: new Date(),
        status: OrderStatus.PENDING, // Initial status
        paymentStatus: PaymentStatus.PENDING, // Initial payment status
        subtotal,
        shippingCost,
        taxAmount,
        totalAmount,
        shippingAddress,
        shippingMethod: createOrderDto.shippingMethod,
        // TODO: Add payment method details
        // paymentMethod: createOrderDto.paymentMethodId,
        items: [], // Items will be created separately
      } as DeepPartial<OrderEntity>); // Explicitly cast to DeepPartial<OrderEntity>

      // Assign relations after creating the entity
      order.user = user;
      order.store = store;

      await queryRunner.manager.save(OrderEntity, order);
      // Create order items from cart items
      for (const item of cart.items) {
        const orderItem = this.orderItemRepository.create({
          order,
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          pricePerUnit: item.product.price,
          // TODO: Add variant details if applicable
          // variantDetails: item.variantDetails,
        });
        order.items.push(orderItem);
        await queryRunner.manager.save(OrderItemEntity, orderItem);
      }

      // Clear the user's cart
      await queryRunner.manager.remove(CartItemEntity, cart.items);
      await queryRunner.manager.remove(CartEntity, cart);

      await queryRunner.commitTransaction();

      this.logger.log(`Order ${order.orderReference} processed successfully for user ${userId}.`);
      return order;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error processing order for user ${userId}: ${error.message}`, error.stack);
      // Re-throw specific exceptions or a generic one
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process order.');
    } finally {
      await queryRunner.release();
    }
  }
}