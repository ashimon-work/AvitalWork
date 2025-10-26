import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodeEntity } from './entities/promo-code.entity';
import { PromoCodesService } from './promo-codes.service';
// import { PromoCodesController } from './promo-codes.controller'; // Uncomment if you add a controller

@Module({
  imports: [TypeOrmModule.forFeature([PromoCodeEntity])],
  providers: [PromoCodesService],
  // controllers: [PromoCodesController], // Uncomment if you add a controller
  exports: [PromoCodesService], // Export service if it's used in other modules
})
export class PromoCodesModule {}
