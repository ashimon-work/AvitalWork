import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PaymentMethodEntity } from './entities/payment-method.entity';
import { UserEntity } from '../users/entities/user.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { AddressEntity } from '../addresses/entities/address.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  private readonly logger = new Logger(PaymentMethodsService.name);

  constructor(
    @InjectRepository(PaymentMethodEntity)
    private readonly paymentMethodRepository: Repository<PaymentMethodEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async findAllForUser(userId: string, storeSlug: string): Promise<PaymentMethodEntity[]> {
    this.logger.log(`Fetching payment methods for user ${userId} in store ${storeSlug}`);
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    return this.paymentMethodRepository.find({
      where: { user: { id: userId }, store: { id: store.id } },
      relations: ['billingAddress'], // Eager load billing address if needed by frontend
    });
  }

  async findOneForUser(userId: string, storeSlug: string, methodId: string): Promise<PaymentMethodEntity> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: methodId, user: { id: userId }, store: { id: store.id } },
      relations: ['billingAddress'],
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID "${methodId}" not found for this user and store.`);
    }
    return paymentMethod;
  }

  async createForUser(userId: string, storeSlug: string, createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethodEntity> {
    this.logger.log(`Creating payment method for user ${userId} in store ${storeSlug}: ${JSON.stringify(createPaymentMethodDto)}`);

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    const store = await this.storeRepository.findOneBy({ slug: storeSlug });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found.`);
    }

    const billingAddress = await this.addressRepository.findOne({
        where: { id: createPaymentMethodDto.billingAddressId, user: { id: userId } }
    });
    if (!billingAddress) {
      throw new BadRequestException(`Billing address with ID "${createPaymentMethodDto.billingAddressId}" not found or does not belong to the user.`);
    }

    // In a real scenario, interact with payment gateway (Stripe, Braintree, etc.) here
    // to get paymentGatewayToken, cardBrand, last4, expiryMonth, expiryYear.
    // For this example, we'll assume these are either passed in (not secure for raw card details)
    // or derived from the paymentGatewayToken by a mock service/logic.

    const newPaymentMethod = this.paymentMethodRepository.create({
      ...createPaymentMethodDto,
      user,
      store,
      billingAddress,
      // Mocked card details based on a token (replace with actual gateway integration)
      cardBrand: createPaymentMethodDto.paymentGatewayToken.includes('visa') ? 'Visa' : 'Mastercard', // Example
      last4: createPaymentMethodDto.paymentGatewayToken.slice(-4), // Example
      // expiryMonth, expiryYear would also come from gateway
    });

    return this.entityManager.transaction(async transactionalEntityManager => {
      if (createPaymentMethodDto.isDefault) {
        // Set all other payment methods for this user in this store to not be default
        await transactionalEntityManager.update(
          PaymentMethodEntity,
          { user: { id: userId }, store: { id: store.id }, isDefault: true },
          { isDefault: false },
        );
      }
      try {
        const savedMethod = await transactionalEntityManager.save(newPaymentMethod);
        this.logger.log(`Payment method ${savedMethod.id} created successfully for user ${userId} in store ${storeSlug}`);
        return savedMethod;
      } catch (error) {
        this.logger.error(`Error creating payment method for user ${userId}: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Could not create payment method.');
      }
    });
  }

  async updateForUser(
    userId: string,
    storeSlug: string,
    methodId: string,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodEntity> {
    this.logger.log(`Updating payment method ${methodId} for user ${userId} in store ${storeSlug}: ${JSON.stringify(updatePaymentMethodDto)}`);

    const paymentMethod = await this.findOneForUser(userId, storeSlug, methodId); // Ensures method exists and belongs to user/store

    if (updatePaymentMethodDto.billingAddressId) {
      const newBillingAddress = await this.addressRepository.findOne({
          where: { id: updatePaymentMethodDto.billingAddressId, user: { id: userId } }
      });
      if (!newBillingAddress) {
        throw new BadRequestException(`New billing address with ID "${updatePaymentMethodDto.billingAddressId}" not found or does not belong to the user.`);
      }
      paymentMethod.billingAddress = newBillingAddress;
    }

    if (typeof updatePaymentMethodDto.isDefault === 'boolean') {
      paymentMethod.isDefault = updatePaymentMethodDto.isDefault;
    }

    return this.entityManager.transaction(async transactionalEntityManager => {
      if (paymentMethod.isDefault) {
         // If this method is being set to default, ensure others are not
        await transactionalEntityManager.update(
          PaymentMethodEntity,
          { user: { id: userId }, store: { id: paymentMethod.store.id }, id: Not(methodId) }, // Exclude current method
          { isDefault: false },
        );
      }
      try {
        const updatedMethod = await transactionalEntityManager.save(paymentMethod);
        this.logger.log(`Payment method ${updatedMethod.id} updated successfully for user ${userId}`);
        return updatedMethod;
      } catch (error) {
        this.logger.error(`Error updating payment method ${methodId} for user ${userId}: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Could not update payment method.');
      }
    });
  }


  async deleteForUser(userId: string, storeSlug: string, methodId: string): Promise<void> {
    this.logger.log(`Attempting to delete payment method ${methodId} for user ${userId} in store ${storeSlug}`);
    const paymentMethod = await this.findOneForUser(userId, storeSlug, methodId); // Ensures method exists and belongs to user/store

    try {
      await this.paymentMethodRepository.remove(paymentMethod);
      this.logger.log(`Payment method ${methodId} deleted successfully for user ${userId} in store ${storeSlug}`);
    } catch (error) {
      this.logger.error(`Error deleting payment method ${methodId} for user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not delete payment method.');
    }
  }
}

// Helper for TypeORM query, needs to be imported from 'typeorm'
import { Not } from 'typeorm';