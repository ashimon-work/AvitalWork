import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethodEntity } from './entities/shipping-method.entity';
import { StoreEntity } from '../stores/entities/store.entity';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    @InjectRepository(ShippingMethodEntity)
    private shippingMethodRepository: Repository<ShippingMethodEntity>,
    @InjectRepository(StoreEntity)
    private storeRepository: Repository<StoreEntity>,
  ) {}

  async getShippingMethodsByStoreSlug(
    storeSlug: string,
  ): Promise<ShippingMethodEntity[]> {
    this.logger.log(`Fetching shipping methods for store slug: ${storeSlug}`);

    const store = await this.storeRepository.findOne({
      where: { slug: storeSlug },
    });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    return this.shippingMethodRepository.find({
      where: { storeId: store.id, isActive: true },
      order: { cost: 'ASC' }, // Optionally order by cost or another field
    });
  }

  // Future methods for managing shipping methods (CRUD) can be added here
  // e.g., createShippingMethod, updateShippingMethod, deleteShippingMethod
}
