import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { AddressEntity } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UserEntity } from '../users/entities/user.entity'; // Import UserEntity for relation

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(AddressEntity)
    private addressesRepository: Repository<AddressEntity>,
  ) {}

  async findAllForUser(userId: string): Promise<AddressEntity[]> {
    return this.addressesRepository.find({
      where: { user: { id: userId } }, // Query by relation ID
      order: { createdAt: 'DESC' }, // Or order by isDefault etc.
    });
  }

  async findOneByIdAndUser(
    addressId: string,
    userId: string,
  ): Promise<AddressEntity> {
    const address = await this.addressesRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    }); // Query by relation ID
    if (!address) {
      throw new NotFoundException(
        `Address with ID "${addressId}" not found for this user.`,
      );
    }
    return address;
  }

  async create(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<AddressEntity> {
    // If setting default, unset other defaults first
    if (createAddressDto.isDefaultShipping) {
      await this.unsetDefaults(userId, 'shipping');
    }
    if (createAddressDto.isDefaultBilling) {
      await this.unsetDefaults(userId, 'billing');
    }

    const newAddress = this.addressesRepository.create({
      ...createAddressDto,
      user: { id: userId } as UserEntity, // Associate with the user
    });
    return this.addressesRepository.save(newAddress);
  }

  async update(
    addressId: string,
    userId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressEntity> {
    const address = await this.findOneByIdAndUser(addressId, userId); // Ensures address exists and belongs to user

    // If setting default, unset other defaults first
    if (updateAddressDto.isDefaultShipping) {
      await this.unsetDefaults(userId, 'shipping', addressId); // Exclude current address if needed
    }
    if (updateAddressDto.isDefaultBilling) {
      await this.unsetDefaults(userId, 'billing', addressId); // Exclude current address if needed
    }

    // Merge changes and save
    this.addressesRepository.merge(address, updateAddressDto);
    return this.addressesRepository.save(address);
  }

  async remove(addressId: string, userId: string): Promise<void> {
    const address = await this.findOneByIdAndUser(addressId, userId); // Check ownership
    // findOneByIdAndUser already checks ownership
    const result = await this.addressesRepository.delete(addressId); // Delete by primary key after checking ownership

    if (result.affected === 0) {
      // This case should ideally be caught by findOneByIdAndUser, but double-check
      throw new NotFoundException(`Address with ID "${addressId}" not found.`);
    }
    // Note: If the deleted address was default, the user might have no default address left.
    // Consider logic to auto-assign a new default if required.
  }

  async setDefault(
    addressId: string,
    userId: string,
    type: 'shipping' | 'billing',
  ): Promise<void> {
    const address = await this.findOneByIdAndUser(addressId, userId); // Check ownership

    await this.unsetDefaults(userId, type, addressId); // Unset others first

    const updateData: Partial<AddressEntity> = {};
    if (type === 'shipping') {
      updateData.isDefaultShipping = true;
    } else {
      updateData.isDefaultBilling = true;
    }

    await this.addressesRepository.update(
      { id: addressId, user: { id: userId } },
      updateData,
    ); // Query by relation ID
  }

  // Helper to unset default flags for a user
  private async unsetDefaults(
    userId: string,
    type: 'shipping' | 'billing',
    excludeAddressId?: string,
  ): Promise<void> {
    // Return void as update result isn't strictly needed here
    const updateData: Partial<AddressEntity> = {};
    const whereClause: any = { user: { id: userId } };

    if (type === 'shipping') {
      whereClause.isDefaultShipping = true;
      updateData.isDefaultShipping = false;
    } else {
      whereClause.isDefaultBilling = true;
      updateData.isDefaultBilling = false;
    }

    // Exclude the address currently being set/updated as default using QueryBuilder
    // This is more complex than initially thought with simple .update()
    // Let's stick to updating all and then setting the specific one back for now for simplicity,
    // but acknowledge this isn't the most efficient.
    // We'll update all matching the criteria first.
    await this.addressesRepository.update(whereClause, updateData);

    // If we were excluding, the logic would be more involved, e.g.:
    // if (excludeAddressId) {
    // This requires a QueryBuilder approach if we need `id != :excludeAddressId`
    // For simplicity now, we update all and then update the target one back to true.
    // A more efficient way:
    // return this.addressesRepository.createQueryBuilder()
    //   .update(AddressEntity)
    //   .set(updateData)
    //   .where("userId = :userId", { userId })
    //   .andWhere("id != :excludeAddressId", { excludeAddressId })
    //   .andWhere(type === 'shipping' ? "isDefaultShipping = true" : "isDefaultBilling = true")
    //   .execute();

    //   // Use QueryBuilder as commented before
    // } else {
    //   await this.addressesRepository.update(whereClause, updateData);
    // }
  }
}
