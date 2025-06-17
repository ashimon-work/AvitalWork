import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) { }

  @Get('home')
  getHomePageData() {
    return this.marketplaceService.getHomePageData();
  }

  @Get('store/:slug')
  async getStorePageData(@Param('slug') slug: string) {
    const storeData = await this.marketplaceService.getStorePageData(slug);
    if (!storeData) {
      throw new NotFoundException(`Store with slug "${slug}" not found.`);
    }
    return storeData;
  }
}
