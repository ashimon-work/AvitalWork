import { Controller, Post, Body, Get, Req, UseGuards, HttpCode, HttpStatus, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { StoresService } from '../stores/stores.service';
import { ContactSubmissionEntity } from './entities/contact-submission.entity';

@UseGuards(StoreContextGuard)
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(
    private readonly contactService: ContactService,
    private readonly storesService: StoresService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createContactSubmission(
    @Req() req: AuthenticatedRequest,
    @Body() createContactSubmissionDto: CreateContactSubmissionDto,
  ): Promise<ContactSubmissionEntity> {
    let storeId: string | undefined = undefined;
    const slugToLookup = createContactSubmissionDto.storeSlug || req.storeSlug;

    if (slugToLookup) {
      try {
        const store = await this.storesService.findBySlug(slugToLookup);
        if (store) {
          storeId = store.id;
        } else {
          this.logger.warn(`Store with slug "${slugToLookup}" not found for contact submission.`);
          // Optionally, you could throw NotFoundException here if storeSlug is mandatory from DTO
          // but the problem states storeId is nullable on the entity.
        }
      } catch (error) {
        this.logger.error(`Error looking up store with slug "${slugToLookup}": ${error.message}`);
        // Decide if this should be a BadRequest or allow submission without storeId
      }
    } else {
        // if no storeSlug is provided in DTO and not in req (e.g. global contact form not tied to a specific store context)
        this.logger.log('No storeSlug provided for contact submission. Proceeding without storeId.');
    }
    
    return this.contactService.createSubmission(createContactSubmissionDto, storeId);
  }

  @Get('/faq')
  async findFaqByStore(@Req() req: AuthenticatedRequest) {
    const storeSlug = req.storeSlug;
    if (!storeSlug) {
        throw new BadRequestException('Store context is missing.');
    }
    return this.contactService.findFaqByStore(storeSlug);
  }
}