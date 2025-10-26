import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqEntity } from './entities/faq.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { ContactSubmissionEntity } from './entities/contact-submission.entity';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(FaqEntity)
    private faqRepository: Repository<FaqEntity>,
    @InjectRepository(StoreEntity)
    private storeRepository: Repository<StoreEntity>,
    @InjectRepository(ContactSubmissionEntity)
    private contactSubmissionRepository: Repository<ContactSubmissionEntity>,
  ) {}

  async createSubmission(
    createContactSubmissionDto: CreateContactSubmissionDto,
    storeId?: string,
  ): Promise<ContactSubmissionEntity> {
    this.logger.log(
      `Creating contact submission: ${JSON.stringify(createContactSubmissionDto)}, storeId: ${storeId}`,
    );
    try {
      const newSubmission = this.contactSubmissionRepository.create({
        ...createContactSubmissionDto,
        storeId: storeId || null,
      });
      return await this.contactSubmissionRepository.save(newSubmission);
    } catch (error) {
      this.logger.error(
        `Failed to create contact submission: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to save contact submission.',
      );
    }
  }

  // Method for GET /api/faq
  async findFaqByStore(storeSlug: string): Promise<FaqEntity[]> {
    this.logger.log(`Fetching FAQ for store ${storeSlug}`);

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    return this.faqRepository.find({
      where: { store: { id: store.id } },
      order: { id: 'ASC' }, // Order FAQ items
    });
  }
}
