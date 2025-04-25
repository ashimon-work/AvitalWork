import { Controller, Get, Query, Logger } from '@nestjs/common';
import { NavigationService, PopularLink } from './navigation.service'; // Import PopularLink

@Controller('navigation')
export class NavigationController {
  private readonly logger = new Logger(NavigationController.name);
  constructor(private readonly navigationService: NavigationService) {}

  @Get('popular')
  async getPopularNavigation(@Query('storeSlug') storeSlug?: string): Promise<PopularLink[]> { // Add explicit return type
    this.logger.log(`Fetching popular navigation for store: ${storeSlug || 'all'}`);
    return this.navigationService.getPopularLinks(storeSlug);
  }
}