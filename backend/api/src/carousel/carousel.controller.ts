import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CarouselService } from './carousel.service';

@Controller('carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) {}

  @Get()
  findAll(@Query('storeSlug') storeSlug?: string) {
    return this.carouselService.findAll(storeSlug);
  }

  // TODO: Update create endpoint to accept storeId and potentially use DTO
  // @Post()
  // create(
  //   @Body('storeId') storeId: string, // Need storeId
  //   @Body('imageUrl') imageUrl: string,
  //   @Body('altText') altText: string,
  //   @Body('linkUrl') linkUrl?: string,
  // ) {
  //   return this.carouselService.create(storeId, imageUrl, altText, linkUrl);
  // }
}