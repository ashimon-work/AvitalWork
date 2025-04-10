import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
// Import controllers and services
import { StoresController } from './stores.controller'; // Uncommented
import { StoresService } from './stores.service'; // Uncommented

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity])], // Register StoreEntity
  controllers: [StoresController], // Uncommented
  providers: [StoresService], // Uncommented
  exports: [TypeOrmModule], // Export TypeOrmModule if other modules need StoreRepository
})
export class StoresModule {}