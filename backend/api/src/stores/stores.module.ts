import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
// Import controllers and services if/when they are created
// import { StoresController } from './stores.controller';
// import { StoresService } from './stores.service';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity])], // Register StoreEntity
  // controllers: [StoresController], // Add controller later if needed
  // providers: [StoresService], // Add service later if needed
  exports: [TypeOrmModule], // Export TypeOrmModule if other modules need StoreRepository
})
export class StoresModule {}