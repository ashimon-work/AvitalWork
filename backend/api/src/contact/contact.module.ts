import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { FaqEntity } from './entities/faq.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { ContactSubmissionEntity } from './entities/contact-submission.entity';
import { StoresModule } from 'src/stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FaqEntity, StoreEntity, ContactSubmissionEntity]),
    StoresModule,
  ],
  providers: [ContactService],
  controllers: [ContactController],
  exports: [ContactService],
})
export class ContactModule {}