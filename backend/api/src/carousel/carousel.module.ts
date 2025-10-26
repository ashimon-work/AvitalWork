import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarouselController } from './carousel.controller';
import { CarouselService } from './carousel.service';
import { CarouselItem } from './entities/carousel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarouselItem])],
  controllers: [CarouselController],
  providers: [CarouselService],
})
export class CarouselModule {}
