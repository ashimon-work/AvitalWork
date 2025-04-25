import { Module } from '@nestjs/common';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';
// Import CategoriesModule if CategoriesService is needed later
// import { CategoriesModule } from '../categories/categories.module';

@Module({
  // imports: [CategoriesModule], // Import if needed later
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}