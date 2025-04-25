import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { StoreEntity } from './entities/store.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storesRepository: Repository<StoreEntity>,
  ) {}

  async searchStores(query: string, limit: number = 10): Promise<StoreEntity[]> {
    const where: FindOptionsWhere<StoreEntity> = {
      name: ILike(`%${query}%`), // Case-insensitive partial match on name
      // Add other conditions if needed, e.g., isActive: true if that field exists
    };

    return this.storesRepository.find({
      where,
      take: limit,
      select: ['id', 'name', 'slug', 'description'], // Select fields needed for display
      order: { name: 'ASC' },
    });
  }

  // Add other store-related methods here if needed later (e.g., findBySlug)
  async findBySlug(slug: string): Promise<StoreEntity | null> {
    return this.storesRepository.findOne({ where: { slug } });
  }
}