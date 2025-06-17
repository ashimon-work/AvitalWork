import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('home')
  getHomePageData() {
    return this.marketplaceService.getHomePageData();
  }
}
