import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarouselItem } from './entities/carousel.entity';

@Injectable()
export class CarouselService {
  constructor(
    @InjectRepository(CarouselItem)
    private carouselRepository: Repository<CarouselItem>,
  ) {}

  async findAll(storeSlug?: string): Promise<CarouselItem[]> {
    if (!storeSlug) {
      throw new Error('Store slug is required to fetch carousel items.');
    }

    return await this.carouselRepository.find({
      where: {
        store: { slug: storeSlug },
      },
      relations: ['store'],
    });
  }

  // TODO: Update create method to accept storeId and associate the item
  // async create(storeId: string, imageUrl: string, altText: string, linkUrl?: string): Promise<CarouselItem> {
  //   const carouselItem = this.carouselRepository.create({ storeId, imageUrl, altText, linkUrl });
  //   return this.carouselRepository.save(carouselItem);
  // }
}
