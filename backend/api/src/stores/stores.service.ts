import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { StoreEntity } from './entities/store.entity';
import { AboutContentEntity } from './entities/about-content.entity';
import { TestimonialEntity } from './entities/testimonial.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storesRepository: Repository<StoreEntity>,
    @InjectRepository(AboutContentEntity)
    private readonly aboutContentRepository: Repository<AboutContentEntity>,
    @InjectRepository(TestimonialEntity)
    private readonly testimonialRepository: Repository<TestimonialEntity>,
  ) {}

  async searchStores(query: string, limit: number = 10): Promise<StoreEntity[]> {
    const where: FindOptionsWhere<StoreEntity> = {
      name: ILike(`%${query}%`), // Case-insensitive partial match on name
      // Add other conditions if needed, e.g., isActive: true if that field exists
    };

    return this.storesRepository.find({
      where,
      take: limit,
      select: ['id', 'name', 'slug', 'description'],
      order: { name: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<StoreEntity | null> {
    return this.storesRepository.findOne({ where: { slug } });
  }

  async findById(id: string): Promise<StoreEntity | null> {
    return this.storesRepository.findOne({ where: { id } });
  }

  async getAboutContentByStoreSlug(storeSlug: string): Promise<AboutContentEntity | null> {
    const store = await this.storesRepository.findOne({ where: { slug: storeSlug } });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }
    // Assuming there's only one about content entry per store
    return this.aboutContentRepository.findOne({ where: { store: { id: store.id } } });
  }

  async getTestimonialsByStoreSlug(storeSlug: string): Promise<TestimonialEntity[]> {
    const store = await this.storesRepository.findOne({ where: { slug: storeSlug } });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }
    return this.testimonialRepository.find({ where: { store: { id: store.id } } });
  }
}