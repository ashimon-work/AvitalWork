import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderEntity, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderDto } from './dto/order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderSortField, SortOrder } from './dto/find-all-manager-orders.dto';
import { FindAllManagerOrdersDto } from './dto/find-all-manager-orders.dto';
import { StoresService } from '../stores/stores.service';
import { UsersService } from '../users/users.service';
import { AddressesService } from '../addresses/addresses.service';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AddOrderNoteDto } from './dto/add-order-note.dto';
import { SendOrderEmailDto } from './dto/SendOrderEmailDto';
import { AddOrderShippingDto } from './dto/add-order-shipping.dto';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { AddressEntity } from '../addresses/entities/address.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private ordersRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemsRepository: Repository<OrderItemEntity>,
    private readonly storesService: StoresService,
    private readonly usersService: UsersService,
    private readonly addressesService: AddressesService,
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto, userId: string): Promise<OrderDto> {
    this.logger.log(`Attempting to create order for user ${userId} with DTO: ${JSON.stringify(createOrderDto)}`);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        this.logger.error(`User not found: ${userId}`);
        throw new NotFoundException(`User with ID "${userId}" not found.`);
      }

      const store = await this.storesService.findById(createOrderDto.storeId);
      if (!store) {
        this.logger.error(`Store not found: ${createOrderDto.storeId}`);
        throw new NotFoundException(`Store with ID "${createOrderDto.storeId}" not found.`);
      }

      const shippingAddress = await this.addressesService.findOneByIdAndUser(createOrderDto.shippingAddressId, userId);
      if (!shippingAddress) {
        this.logger.error(`Shipping address not found: ${createOrderDto.shippingAddressId} for user ${userId}`);
        throw new NotFoundException(`Shipping address with ID "${createOrderDto.shippingAddressId}" not found for this user.`);
      }

      let billingAddress: AddressEntity | undefined = undefined;
      if (createOrderDto.billingAddressId) {
        if (createOrderDto.billingAddressId === createOrderDto.shippingAddressId) {
          billingAddress = shippingAddress;
        } else {
          billingAddress = await this.addressesService.findOneByIdAndUser(createOrderDto.billingAddressId, userId);
          if (!billingAddress) {
            this.logger.error(`Billing address not found: ${createOrderDto.billingAddressId} for user ${userId}`);
            throw new NotFoundException(`Billing address with ID "${createOrderDto.billingAddressId}" not found for this user.`);
          }
        }
      } else {
        // If no billing address ID is provided, assume it's the same as shipping
        billingAddress = shippingAddress;
      }

      const order = new OrderEntity();
      order.user = user;
      order.store = store;
      order.shippingAddress = shippingAddress;
      order.billingAddress = billingAddress; // Can be same as shippingAddress
      order.status = OrderStatus.PENDING; // Initial status
      order.paymentStatus = PaymentStatus.PENDING; // Initial payment status
      order.shippingMethod = createOrderDto.shippingMethod;
      order.promoCode = createOrderDto.promoCode;

      // Use totals from DTO if provided, otherwise they might be calculated or default
      order.subtotal = createOrderDto.subtotalAmount ?? 0;
      order.discountAmount = createOrderDto.discountAmount ?? 0;
      order.shippingCost = createOrderDto.shippingCostAmount ?? 0;
      order.taxAmount = createOrderDto.taxAmount ?? 0;
      order.totalAmount = createOrderDto.grandTotalAmount ?? 0;

      // A more robust way to calculate total if not provided or for verification:
      // order.totalAmount = order.subtotal - order.discountAmount + order.shippingCost + order.taxAmount;
      // For now, we trust the frontend or a previous calculation step that populates the DTO.

      const savedOrder = await queryRunner.manager.save(order);
      this.logger.log(`Order entity saved with ID: ${savedOrder.id}`);

      const orderItems: OrderItemEntity[] = [];
      for (const itemDto of createOrderDto.items) {
        const orderItem = new OrderItemEntity();
        orderItem.order = savedOrder;
        orderItem.productId = itemDto.productId;
        orderItem.variantId = itemDto.variantId;
        orderItem.quantity = itemDto.quantity;
        orderItem.pricePerUnit = itemDto.priceAtPurchase; // Store price at time of purchase

        // Fetch product details to set productName and variantDetails
        // This assumes ProductsService has a method to get basic product info
        // For simplicity, we might need to adjust this if product details are complex
        const product = await this.productsService.findOne(itemDto.productId, store.id); // Assuming findOne takes productId and storeId
        if (!product) {
            this.logger.error(`Product not found during order item creation: ${itemDto.productId}`);
            throw new NotFoundException(`Product with ID "${itemDto.productId}" not found.`);
        }
        orderItem.productName = product.name;

        if (itemDto.variantId) {
            const variant = product.variants?.find(v => v.id === itemDto.variantId);
            if (variant && variant.options) {
              orderItem.variantDetails = variant.options.map(opt => `${opt.name}: ${opt.value}`).join(', ');
            } else {
              orderItem.variantDetails = 'N/A';
            }
        } else {
            orderItem.variantDetails = 'N/A';
        }


        // Decrease stock
        try {
          await this.productsService.decreaseStock(
            queryRunner.manager, // Pass the transaction manager
            itemDto.productId,
            itemDto.variantId,
            itemDto.quantity,
            store.id
          );
          this.logger.log(`Stock decreased for product ${itemDto.productId}, variant ${itemDto.variantId}`);
        } catch (error) {
          this.logger.error(`Failed to decrease stock for product ${itemDto.productId}: ${error.message}`);
          if (error.message.includes('Insufficient stock')) { // More specific error check if possible
            throw new BadRequestException(error.message);
          }
          throw new InternalServerErrorException(`Failed to update stock for product ${itemDto.productId}.`);
        }
        orderItems.push(orderItem);
      }

      await queryRunner.manager.save(orderItems);
      this.logger.log(`${orderItems.length} order items saved.`);
      savedOrder.items = orderItems; // Link items back to the order for the return DTO

      // Placeholder: Payment Processing
      this.logger.log(`Placeholder: Simulating payment processing for order ${savedOrder.id}...`);
      // Simulate payment success
      savedOrder.paymentStatus = PaymentStatus.PAID; // Corrected from COMPLETED
      savedOrder.status = OrderStatus.PROCESSING; // Update status after successful payment
      await queryRunner.manager.save(savedOrder); // Save again to update status
      this.logger.log(`Placeholder: Payment processed successfully for order ${savedOrder.id}. Status updated to ${savedOrder.status}.`);

      // Clear cart
      try {
        await this.cartService.clearCart(userId, store.id, queryRunner.manager); // Pass transaction manager
        this.logger.log(`Cart cleared for user ${userId} in store ${store.id}`);
      } catch (error) {
        this.logger.error(`Failed to clear cart for user ${userId}: ${error.message}`);
        // Decide if this should roll back the transaction or just log.
        // For now, we'll let it roll back if it throws.
        throw new InternalServerErrorException('Failed to clear user cart.');
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Order ${savedOrder.id} creation transaction committed.`);
      // Re-fetch the order with all relations for the DTO mapping
      const completeOrder = await this.ordersRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items', 'items.product', 'shippingAddress', 'billingAddress', 'user', 'store'],
      });
      if (!completeOrder) {
        this.logger.error(`Failed to re-fetch complete order ${savedOrder.id} after transaction.`);
        throw new InternalServerErrorException('Order created but could not be retrieved.');
      }
      return this.mapOrderToDto(completeOrder);

    } catch (error) {
      this.logger.error(`Error during order creation: ${error.message}`, error.stack);
      await queryRunner.rollbackTransaction();
      this.logger.warn(`Order creation transaction rolled back due to error.`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to create order: ${error.message}`);
    } finally {
      await queryRunner.release();
      this.logger.log(`Query runner released for order creation of user ${userId}.`);
    }
  }

  async addShippingForManager(
    storeSlug: string,
    orderId: string,
    addOrderShippingDto: AddOrderShippingDto,
  ): Promise<OrderDto> {
    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId, store: { id: store.id } },
      relations: ['items', 'items.product', 'shippingAddress', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found for this store.`);
    }

    order.trackingNumber = addOrderShippingDto.trackingNumber;
    order.shippingMethod = addOrderShippingDto.carrier;

    const updatedOrder = await this.ordersRepository.save(order);

    return this.mapOrderToDto(updatedOrder);
  }
  // Method to generate a packing slip for a specific order for a specific store
  async generatePackingSlipForManager(storeSlug: string, orderId: string): Promise<string> {
    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId, store: { id: store.id } },
      relations: ['items', 'items.product', 'shippingAddress', 'user'], // Ensure all needed relations are loaded
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found for this store.`);
    }

    // Generate simple text packing slip
    let packingSlipContent = `--- Packing Slip ---\n\n`;
    packingSlipContent += `Store: ${store.name}\n`; // Assuming store name is available on the store object
    packingSlipContent += `Order Reference: ${order.orderReference}\n`;
    packingSlipContent += `Order Date: ${order.orderDate.toDateString()}\n\n`;

    packingSlipContent += `Shipping Address:\n`;
    if (order.shippingAddress) {
      packingSlipContent += `${order.shippingAddress.fullName}\n`;
      packingSlipContent += `${order.shippingAddress.street1}\n`;
      if (order.shippingAddress.street2) {
        packingSlipContent += `${order.shippingAddress.street2}\n`;
      }
      packingSlipContent += `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}\n`; // Removed stateProvince as it doesn't exist
      packingSlipContent += `${order.shippingAddress.country}\n`;
    } else {
      packingSlipContent += `No shipping address provided.\n`;
    }
    packingSlipContent += `\n`;

    packingSlipContent += `Items:\n`;
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        packingSlipContent += `- ${item.quantity} x ${item.productName} (SKU: ${item.product?.sku || 'N/A'}) - ${item.variantDetails || 'No variant'}\n`;
      });
    } else {
      packingSlipContent += `No items in this order.\n`;
    }
    packingSlipContent += `\n`;

    packingSlipContent += `Total Amount: ${order.totalAmount.toFixed(2)}\n`;
    packingSlipContent += `Payment Status: ${order.paymentStatus}\n`;
    packingSlipContent += `Shipping Method: ${order.shippingMethod || 'N/A'}\n`;
    packingSlipContent += `Tracking Number: ${order.trackingNumber || 'N/A'}\n`;
    packingSlipContent += `\n`;

    packingSlipContent += `--- End of Packing Slip ---\n`;


    return packingSlipContent;
  }

  // Method to find orders for a specific user (Storefront customer view)
  async findAllForUser(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: OrderDto[], total: number }> {
    const skip = (page - 1) * limit;
    const [orders, total] = await this.ordersRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'shippingAddress'], // Eager load necessary relations
      order: { orderDate: 'DESC' }, // Default sort for customer view
      skip: skip,
      take: limit,
    });

    // Map entities to DTOs
    const orderDtos = orders.map(order => this.mapOrderToDto(order));

    return { orders: orderDtos, total };
  }

  // Method to find all orders for a specific customer within a specific store (Manager View)
  async findAllForCustomerInStore(
    storeSlug: string,
    customerId: string,
    options: { page?: number; limit?: number; sortBy?: string; sortDirection?: 'ASC' | 'DESC' },
  ): Promise<{ orders: OrderDto[], total: number }> {
    this.logger.log(`Finding orders for customer ${customerId} in store ${storeSlug} with options: ${JSON.stringify(options)}`);

    const { page = 1, limit = 10, sortBy = 'orderDate', sortDirection = 'DESC' } = options;
    const skip = (page - 1) * limit;

    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      this.logger.error(`Store not found: ${storeSlug}`);
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const customer = await this.usersService.findOneById(customerId);
    if (!customer) {
        this.logger.error(`Customer not found: ${customerId}`);
        throw new NotFoundException(`Customer with ID "${customerId}" not found.`);
    }

    const queryBuilder = this.ordersRepository.createQueryBuilder('order');

    queryBuilder
      .leftJoinAndSelect('order.items', 'items')
      // .leftJoinAndSelect('items.product', 'product') // Product details might not be needed for a simple list
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoinAndSelect('order.user', 'user') // User is already filtered, but good to select for DTO mapping
      .leftJoinAndSelect('order.store', 'store') // Store is already filtered, but good to select
      .where('order.store.id = :storeId', { storeId: store.id })
      .andWhere('order.user.id = :userId', { userId: customerId });

    // Validate sortBy field to prevent SQL injection if it's directly used
    const validSortFields = ['orderDate', 'totalAmount', 'status', 'createdAt', 'updatedAt', 'orderReference']; // Add more as needed
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'orderDate';

    queryBuilder
      .orderBy(`order.${safeSortBy}`, sortDirection)
      .skip(skip)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();
    this.logger.log(`Found ${total} orders for customer ${customerId} in store ${storeSlug}. Returning page ${page} of ${Math.ceil(total / limit)}.`);

    const orderDtos = orders.map(order => this.mapOrderToDto(order));

    return { orders: orderDtos, total };
  }

  // Method to find orders for a specific store (Store Management view)
  async findAllForManager(
    storeSlug: string,
    query: FindAllManagerOrdersDto,
  ): Promise<{ orders: OrderDto[], total: number }> {
    const { page = 1, limit = 10, search, status, startDate, endDate, sortBy = OrderSortField.createdAt, sortOrder = SortOrder.DESC } = query;
    const skip = (page - 1) * limit;

    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }
    const storeId = store.id;

    const queryBuilder = this.ordersRepository.createQueryBuilder('order');

    queryBuilder
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.store.id = :storeId', { storeId });


    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('order.orderDate >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere('order.orderDate <= :endDate', { endDate: new Date(endDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        '(order.id LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy(`order.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    // Map entities to DTOs
    const orderDtos = orders.map(order => this.mapOrderToDto(order));

    return { orders: orderDtos, total };
  }

  // Method to export orders for a specific store (Store Management view)
  async exportForManager(
    storeSlug: string,
    query: FindAllManagerOrdersDto,
  ): Promise<string> {
    const { search, status, startDate, endDate, sortBy = OrderSortField.createdAt, sortOrder = SortOrder.DESC } = query;

    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }
    const storeId = store.id;

    const queryBuilder = this.ordersRepository.createQueryBuilder('order');

    queryBuilder
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.store.id = :storeId', { storeId });


    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('order.orderDate >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere('order.orderDate <= :endDate', { endDate: new Date(endDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        '(order.id LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy(`order.${sortBy}`, sortOrder);
    // No pagination for export - get all results

    const orders = await queryBuilder.getMany();

    // Format data as CSV
    let csvContent = "Order ID,Order Reference,Order Date,Status,Total Amount,Subtotal,Shipping Cost,Tax Amount,Shipping Address,Shipping Method,Payment Status,Tracking Number,Customer Name,Customer Email,Items,Notes\n";

    orders.forEach(order => {
      const shippingAddress = order.shippingAddress ?
        `${order.shippingAddress.fullName}, ${order.shippingAddress.street1}, ${order.shippingAddress.street2 ? order.shippingAddress.street2 + ', ' : ''}${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
        : 'N/A';

      const customerName = order.user ? `${order.user.firstName} ${order.user.lastName}` : 'N/A';
      const customerEmail = order.user ? order.user.email : 'N/A';

      const items = order.items && order.items.length > 0 ?
        order.items.map(item => `${item.quantity}x ${item.productName} (SKU: ${item.product?.sku || 'N/A'})`).join('; ')
        : 'No items';

      const notes = order.notes && order.notes.length > 0 ?
        order.notes.join('; ').replace(/"/g, '""') // Escape double quotes for CSV
        : 'N/A';

      // Basic CSV escaping for fields that might contain commas or quotes
      const escapeCsv = (value: any) => {
        if (value === null || value === undefined) return '';
        let stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      csvContent += `${escapeCsv(order.id)},${escapeCsv(order.orderReference)},${escapeCsv(order.orderDate.toISOString())},${escapeCsv(order.status)},${escapeCsv(order.totalAmount)},${escapeCsv(order.subtotal)},${escapeCsv(order.shippingCost)},${escapeCsv(order.taxAmount)},"${escapeCsv(shippingAddress)}",${escapeCsv(order.shippingMethod)},${escapeCsv(order.paymentStatus)},${escapeCsv(order.trackingNumber)},${escapeCsv(customerName)},${escapeCsv(customerEmail)},"${escapeCsv(items)}","${escapeCsv(notes)}"\n`;
    });

    return csvContent;
  }


  // Method to find a single order by ID for a specific user (Storefront customer view)
  async findOneByIdAndUser(orderId: string, userId: string): Promise<OrderDto> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['items', 'items.product', 'shippingAddress'], // Ensure all needed relations are loaded
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found for this user.`);
    }

    return this.mapOrderToDto(order);
  }

  // Method to find a single order by ID for a specific store (Store Management view)
  async findOneForManager(storeSlug: string, orderId: string): Promise<OrderDto> {
    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId, store: { id: store.id } }, // Filter by order ID and store ID
      relations: ['items', 'items.product', 'shippingAddress', 'user'], // Ensure all needed relations are loaded including user
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found for this store.`);
    }

    return this.mapOrderToDto(order);
  }

  // Method to update the status of an order for a specific store
  async updateStatusForManager(storeSlug: string, orderId: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderDto> {
    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId, store: { id: store.id } },
      relations: ['items', 'items.product', 'shippingAddress', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found for this store.`);
    }

    order.status = updateOrderStatusDto.status;

    const updatedOrder = await this.ordersRepository.save(order);

    return this.mapOrderToDto(updatedOrder);
  }


  // Method to add a note to an order for a specific store
  async addNoteForManager(storeSlug: string, orderId: string, addOrderNoteDto: AddOrderNoteDto): Promise<OrderDto> {
    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId, store: { id: store.id } }, // Find order by ID and store ID
      relations: ['items', 'items.product', 'shippingAddress', 'user'], // Ensure all needed relations are loaded
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found for this store.`);
    }

    // Add the new note to the notes array
    if (!order.notes) {
      order.notes = [];
    }
    order.notes.push(addOrderNoteDto.note);

    const updatedOrder = await this.ordersRepository.save(order);

    return this.mapOrderToDto(updatedOrder);
  }
  // Method to send an email to the customer for a specific order (Store Management view)
  async sendEmailToCustomerForManager(storeSlug: string, orderId: string, sendOrderEmailDto: SendOrderEmailDto): Promise<{ success: boolean, message: string }> {
    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId, store: { id: store.id } },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found for this store.`);
    }

    if (!order.user || !order.user.email) {
      throw new NotFoundException(`Customer email not available for order with ID "${orderId}".`);
    }

    const customerEmail = order.user.email;
    const { subject, body } = sendOrderEmailDto;

    // Placeholder for sending email - log details
    console.log(`Sending email to: ${customerEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    // In a real implementation, integrate with an email service here.
    // Example: await this.emailService.sendEmail(customerEmail, subject, body);

    return { success: true, message: `Email scheduled to be sent to ${customerEmail}.` };
  }


  // Method to cancel an order for a specific store
  async cancelOrderForManager(storeSlug: string, orderId: string): Promise<OrderDto> {
    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId, store: { id: store.id } },
      relations: ['items', 'items.product', 'shippingAddress', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found for this store.`);
    }

    // Update the status to 'Cancelled'
    order.status = OrderStatus.CANCELLED;

    const updatedOrder = await this.ordersRepository.save(order);

    return this.mapOrderToDto(updatedOrder);
  }

  async markOrderAsFulfilledForManager(storeSlug: string, orderId: string): Promise<OrderDto> {
    this.logger.log(`Attempting to mark order ${orderId} as fulfilled for store ${storeSlug}`);
    const store = await this.storesService.findBySlug(storeSlug);
    if (!store) {
      this.logger.error(`Store not found: ${storeSlug}`);
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId, store: { id: store.id } },
      relations: ['items', 'items.product', 'shippingAddress', 'user'],
    });

    if (!order) {
      this.logger.error(`Order not found: ${orderId} for store ${storeSlug}`);
      throw new NotFoundException(`Order with ID "${orderId}" not found for this store.`);
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.SHIPPED) {
        // Or if there's a specific "Fulfilled" status, check against that too.
        // For now, if it's already completed or shipped, we can consider it a no-op or throw a BadRequestException.
        this.logger.warn(`Order ${orderId} is already in status ${order.status}. No action taken.`);
        // Optionally, throw new BadRequestException(`Order is already ${order.status}.`);
        // For now, let's return the order as is if it's already in a final state.
        // Or, we can still update fulfilledAt if it's not set.
    }

    order.status = OrderStatus.COMPLETED; // Using COMPLETED as the fulfilled status
    order.fulfilledAt = new Date();

    const updatedOrder = await this.ordersRepository.save(order);
    this.logger.log(`Order ${orderId} marked as fulfilled. Status: ${updatedOrder.status}, FulfilledAt: ${updatedOrder.fulfilledAt}`);
    return this.mapOrderToDto(updatedOrder);
  }

  async requestShippingLabelForManager(storeSlug: string, orderId: string): Promise<{ message: string }> {
    this.logger.log(`Placeholder: Shipping label requested for order ${orderId} in store ${storeSlug}.`);
    // In a real scenario, you might find the order to ensure it exists:
    // const store = await this.storesService.findBySlug(storeSlug);
    // if (!store) {
    //   throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    // }
    // const order = await this.ordersRepository.findOne({ where: { id: orderId, store: { id: store.id } } });
    // if (!order) {
    //   throw new NotFoundException(`Order with ID "${orderId}" not found for this store.`);
    // }
    // Then, interact with a shipping service API.

    return { message: `Shipping label generation for order ${orderId} is a placeholder and not yet implemented.` };
  }

  // Helper method to map OrderEntity to OrderDto
  private mapOrderToDto(order: OrderEntity): OrderDto {
    return {
      id: order.id,
      orderReference: order.orderReference,
      orderDate: order.orderDate,
      status: order.status,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      shippingAddress: order.shippingAddress, // Assuming AddressEntity structure matches what frontend needs
      shippingMethod: order.shippingMethod,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      items: order.items.map(item => ({ // Map items to OrderItemDto
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        variantDetails: item.variantDetails,
        // Optionally include partial product details if needed
        // product: item.product ? { id: item.product.id, imageUrl: item.product.imageUrl } : undefined
      })),
      updatedAt: order.updatedAt,
      notes: order.notes, // Include notes in the DTO
      // Include user info for manager view
      user: order.user ? { id: order.user.id, firstName: order.user.firstName, lastName: order.user.lastName, email: order.user.email } : undefined,
    };
  }
}
