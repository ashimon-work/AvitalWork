import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from './entities/address.entity';
// Import Controller and Service later when created
import { AddressesController } from './addresses.controller'; // Import Controller
import { AddressesService } from './addresses.service'; // Import Service

@Module({
  imports: [TypeOrmModule.forFeature([AddressEntity])],
  controllers: [AddressesController], // Add Controller
  providers: [AddressesService], // Add Service
})
export class AddressesModule {}