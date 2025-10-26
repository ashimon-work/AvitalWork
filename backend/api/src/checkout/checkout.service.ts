import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial } from 'typeorm';
import {
  OrderEntity,
  OrderStatus,
  PaymentStatus,
} from '../orders/entities/order.entity';
import { OrderItemEntity } from '../orders/entities/order-item.entity';
import { CartEntity } from '../cart/entities/cart.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { AddressEntity } from '../addresses/entities/address.entity';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { CartItemEntity } from '../cart/entities/cart-item.entity';
import { TaxEstimateQueryDto } from './dto/tax-estimate.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import {
  TranzilaService,
  TranzilaPaymentRequest,
  TranzilaDocumentRequest,
} from '../tranzila/tranzila.service';
import { CreditCardEntity } from '../tranzila/entities/credit-card.entity';
import { TranzilaDocumentEntity } from '../tranzila/entities/tranzila-document.entity';
import { ConfigService } from '@nestjs/config';

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
    @InjectRepository(CreditCardEntity)
    private creditCardRepository: Repository<CreditCardEntity>,
    @InjectRepository(TranzilaDocumentEntity)
    private tranzilaDocumentRepository: Repository<TranzilaDocumentEntity>,
    private dataSource: DataSource,
    private tranzilaService: TranzilaService,
    private configService: ConfigService,
  ) {}

  // Placeholder method for GET /api/tax/estimate
  async getTaxEstimate(
    storeSlug: string,
    query: TaxEstimateQueryDto,
  ): Promise<{ estimatedTax: number }> {
    this.logger.log(
      `Estimating tax for store ${storeSlug} with query ${JSON.stringify(query)}`,
    );

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
  async processOrder(
    userId: string,
    storeSlug: string,
    checkoutOrderDto: CheckoutOrderDto,
  ): Promise<OrderEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(
        `Processing order for user ${userId} in store ${storeSlug}`,
      );

      const user = await queryRunner.manager.findOneBy(UserEntity, {
        id: userId,
      });
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const store = await queryRunner.manager.findOneBy(StoreEntity, {
        slug: storeSlug,
      });
      if (!store) {
        throw new NotFoundException('Store not found.');
      }

      // Create shipping address from form data
      const shippingAddress = queryRunner.manager.create(AddressEntity, {
        user,
        fullName: `${checkoutOrderDto.shippingAddress.firstName} ${checkoutOrderDto.shippingAddress.lastName}`,
        street1: checkoutOrderDto.shippingAddress.address1,
        street2: checkoutOrderDto.shippingAddress.address2,
        city: checkoutOrderDto.shippingAddress.city,
        postalCode: checkoutOrderDto.shippingAddress.zipCode,
        country: checkoutOrderDto.shippingAddress.country,
        isDefaultShipping: false,
        isDefaultBilling: false,
      });
      await queryRunner.manager.save(AddressEntity, shippingAddress);

      // Create billing address from form data
      const billingAddress = queryRunner.manager.create(AddressEntity, {
        user,
        fullName: `${checkoutOrderDto.billingAddress.firstName} ${checkoutOrderDto.billingAddress.lastName}`,
        street1: checkoutOrderDto.billingAddress.address1,
        street2: checkoutOrderDto.billingAddress.address2,
        city: checkoutOrderDto.billingAddress.city,
        postalCode: checkoutOrderDto.billingAddress.zipCode,
        country: checkoutOrderDto.billingAddress.country,
        isDefaultShipping: false,
        isDefaultBilling: false,
      });
      await queryRunner.manager.save(AddressEntity, billingAddress);

      // Calculate order totals from cart items data
      let subtotal = 0;
      for (const item of checkoutOrderDto.cartItems) {
        subtotal += item.price * item.quantity;
        const product = await queryRunner.manager.findOne(ProductEntity, {
          where: { id: item.productId },
        });
        if (!product || product.stockLevel < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}`,
          );
        }
        product.stockLevel -= item.quantity;
        await queryRunner.manager.save(ProductEntity, product);
      }

      // Use provided totals from frontend (they should match our calculations)
      const shippingCost = checkoutOrderDto.shippingCost || 0;
      const taxAmount = checkoutOrderDto.taxAmount || 0;
      const totalAmount =
        checkoutOrderDto.total || subtotal + shippingCost + taxAmount;

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
        billingAddress,
        shippingMethod: checkoutOrderDto.shippingMethodId,
        items: [], // Items will be created separately
      } as DeepPartial<OrderEntity>); // Explicitly cast to DeepPartial<OrderEntity>

      // Assign relations after creating the entity
      order.user = user;
      order.store = store;

      await queryRunner.manager.save(OrderEntity, order);

      // Create order items from cart items data
      for (const item of checkoutOrderDto.cartItems) {
        // Fetch product details for the order item
        const product = await queryRunner.manager.findOne(ProductEntity, {
          where: { id: item.productId },
        });
        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }

        const orderItem = this.orderItemRepository.create({
          order,
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          pricePerUnit: item.price,
          // TODO: Add variant details if applicable
          // variantDetails: item.variantDetails,
        });
        order.items.push(orderItem);
        await queryRunner.manager.save(OrderItemEntity, orderItem);
      }

      // Process payment through Tranzila
      await this.processPaymentWithTranzila(queryRunner, order, user);

      // Create financial document if payment was successful
      if (order.paymentStatus === PaymentStatus.COMPLETED) {
        await this.createTranzilaDocument(queryRunner, order, user);
      }

      // Note: Cart clearing is handled by the frontend since we're not using database cart

      await queryRunner.commitTransaction();

      this.logger.log(
        `Order ${order.orderReference} processed successfully for user ${userId}.`,
      );
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error processing order for user ${userId}: ${error.message}`,
        error.stack,
      );
      // Re-throw specific exceptions or a generic one
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process order.');
    } finally {
      await queryRunner.release();
    }
  }

  private async processPaymentWithTranzila(
    queryRunner: any,
    order: OrderEntity,
    user: UserEntity,
  ): Promise<void> {
    // Get user's stored credit card
    const creditCard = await queryRunner.manager.findOne(CreditCardEntity, {
      where: { user: { id: user.id } },
    });

    if (!creditCard) {
      this.logger.warn(
        `No credit card found for user ${user.id}. Skipping payment processing.`,
      );
      return;
    }

    // Convert amount to cents for Tranzila
    const amountInCents = Math.round(order.totalAmount * 100);

    const paymentRequest: TranzilaPaymentRequest = {
      amount: amountInCents,
      currency: 'ILS', // Default to ILS, can be made configurable
      userId: user.id,
      userEmail: user.email,
      orderDescription: `Order ${order.orderReference}`,
      internalOrderId: order.orderReference,
      creditCardToken: creditCard.token,
      expdate: creditCard.expdate,
    };

    try {
      const paymentResult =
        await this.tranzilaService.processPayment(paymentRequest);

      if (paymentResult.success) {
        order.paymentStatus = PaymentStatus.COMPLETED;
        order.status = OrderStatus.PROCESSING;
        order.tranzilaTransactionId = paymentResult.tranzilaTransactionId;
        this.logger.log(
          `Payment successful for order ${order.orderReference}. Transaction ID: ${paymentResult.tranzilaTransactionId}`,
        );
      } else {
        order.paymentStatus = PaymentStatus.FAILED;
        order.status = OrderStatus.CANCELLED;
        order.paymentErrorMessage = paymentResult.message;
        this.logger.warn(
          `Payment failed for order ${order.orderReference}: ${paymentResult.message}`,
        );
        throw new BadRequestException(
          `Payment failed: ${paymentResult.message}`,
        );
      }

      await queryRunner.manager.save(OrderEntity, order);
    } catch (error) {
      order.paymentStatus = PaymentStatus.FAILED;
      order.status = OrderStatus.CANCELLED;
      order.paymentErrorMessage = error.message;
      await queryRunner.manager.save(OrderEntity, order);
      throw error;
    }
  }

  private async createTranzilaDocument(
    queryRunner: any,
    order: OrderEntity,
    user: UserEntity,
  ): Promise<void> {
    const defaultVatPercent = this.configService.get<string>(
      'DEFAULT_VAT_PERCENT',
      '18.0',
    );
    const terminalName = this.configService.get<string>(
      'TRANZILA_TERMINAL_NAME',
      '',
    );

    if (!terminalName) {
      this.logger.warn(
        'TRANZILA_TERMINAL_NAME not configured. Skipping document creation.',
      );
      return;
    }

    // Get user's credit card for payment info
    const creditCard = await queryRunner.manager.findOne(CreditCardEntity, {
      where: { user: { id: user.id } },
    });

    const documentRequest: TranzilaDocumentRequest = {
      terminalName,
      documentType: 'IR', // Tax Invoice/Receipt
      action: 1, // Debit
      documentCurrencyCode: 'ILS',
      vatPercent: defaultVatPercent,
      clientName:
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      clientEmail: user.email,
      clientId: user.id,
      items: order.items.map((item) => ({
        name: item.productName,
        type: 'I', // Item
        unitsNumber: item.quantity.toString(),
        unitType: 1, // Unit
        unitPrice: Math.round(item.pricePerUnit * 100), // Price in cents
        priceType: 'G', // Gross price
        currencyCode: 'ILS',
      })),
      payments: [
        {
          paymentMethod: 1, // Credit Card
          paymentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          ccLast4Digits: creditCard?.lastFour,
          amount: Math.round(order.totalAmount * 100), // Amount in cents
          currencyCode: 'ILS',
        },
      ],
    };

    try {
      const documentResult =
        await this.tranzilaService.createFinancialDocument(documentRequest);

      if (documentResult.document) {
        const tranzilaDocument = queryRunner.manager.create(
          TranzilaDocumentEntity,
          {
            order,
            transactionId: order.tranzilaTransactionId,
            tranzilaDocumentId: documentResult.document.id,
            tranzilaDocumentNumber: documentResult.document.number,
            tranzilaRetrievalKey: documentResult.document.retrievalKey,
            metadata: documentResult,
          },
        );

        await queryRunner.manager.save(
          TranzilaDocumentEntity,
          tranzilaDocument,
        );
        this.logger.log(
          `Financial document created for order ${order.orderReference}. Document ID: ${documentResult.document.id}`,
        );
      }
    } catch (error) {
      // Don't fail the order if document creation fails
      this.logger.error(
        `Failed to create financial document for order ${order.orderReference}: ${error.message}`,
      );
    }
  }
}
