import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderDto } from './dto/order.dto'; // Import DTO
import { OrderItemDto } from './dto/order-item.dto'; // Import DTO

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private ordersRepository: Repository<OrderEntity>,
    // Inject OrderItemRepository if needed for complex item queries later
  ) {}

  // Method to find orders for a specific user
  async findAllForUser(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: OrderDto[], total: number }> {
    const skip = (page - 1) * limit;
    const [orders, total] = await this.ordersRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'shippingAddress'], // Eager load necessary relations
      order: { orderDate: 'DESC' },
      skip: skip,
      take: limit,
    });

    // Map entities to DTOs
    const orderDtos = orders.map(order => this.mapOrderToDto(order));

    return { orders: orderDtos, total };
  }

  // Method to find a single order by ID for a specific user
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
    };
  }

  // Add methods for creating/updating orders if needed (likely handled by checkout process)
}