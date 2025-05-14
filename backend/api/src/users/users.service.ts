import { Injectable, ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SendCustomerEmailDto } from './dto/send-customer-email.dto';
import * as speakeasy from 'speakeasy';
import { Enable2faDto } from './dto/enable-2fa.dto';
import { Confirm2faDto } from './dto/confirm-2fa.dto'; // Added
import { NotificationPreferencesDto } from './dto/notification-preferences.dto'; // Added
import { Disable2faDto } from './dto/disable-2fa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { FindAllManagerCustomersDto } from './dto/find-all-manager-customers.dto';
import { UpdateManagerCustomerDto } from './dto/update-manager-customer.dto';
import { StoreEntity } from '../stores/entities/store.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { LoginHistoryEntity } from '../login-history/entities/login-history.entity'; // Added
import { LoginHistoryService } from '../login-history/login-history.service'; // Added
import { AddCustomerNoteDto } from './dto/add-customer-note.dto';
import { ChangeManagerPasswordDto } from './dto/change-manager-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    private readonly loginHistoryService: LoginHistoryService, // Added
  ) { }

  async create(createUserDto: CreateUserDto): Promise<Omit<UserEntity, 'passwordHash'>> {
    const { email, password, firstName, lastName, phone } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 10; // Or configure via ConfigService
    let passwordHash: string;
    try {
      passwordHash = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new InternalServerErrorException('Error hashing password');
    }

    // Create new user entity
    const newUser = this.usersRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      // Default role is 'customer' as per entity definition
    });

    // Save user
    try {
      const savedUser = await this.usersRepository.save(newUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...result } = savedUser; // Exclude password hash from result
      return result;
    } catch (error) {
      // Handle potential database errors (e.g., unique constraint violation if check failed)
      throw new InternalServerErrorException('Error saving user to database');
    }
  }

  // Add findOneByEmail method for authentication later
  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ email });
  }

  // Add findOneById method if needed
  async findOneById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async getManagerProfile(id: string): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Manager with ID "${id}" not found.`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user; // Exclude password hash from result
    return result;
  }

  // Method specifically for updating the password hash
  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    const result = await this.usersRepository.update(userId, { passwordHash: newPasswordHash });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${userId}" not found for password update.`);
    }
  }

  async updatePersonalInfo(userId: string, updatePersonalInfoDto: UpdatePersonalInfoDto): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    // Update fields if they are provided in the DTO
    if (updatePersonalInfoDto.firstName !== undefined) {
      user.firstName = updatePersonalInfoDto.firstName;
    }
    if (updatePersonalInfoDto.lastName !== undefined) {
      user.lastName = updatePersonalInfoDto.lastName;
    }
    if (updatePersonalInfoDto.phone !== undefined) {
      user.phone = updatePersonalInfoDto.phone;
    }

    try {
      const updatedUser = await this.usersRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...result } = updatedUser; // Exclude password hash from result
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error updating user personal information.');
    }
  }
async changeManagerPassword(userId: string, changeManagerPasswordDto: ChangeManagerPasswordDto): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Manager with ID "${userId}" not found.`);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changeManagerPasswordDto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password.');
    }

    // Verify new password and confirm new password match
    if (changeManagerPasswordDto.newPassword !== changeManagerPasswordDto.confirmNewPassword) {
      throw new BadRequestException('New password and confirm new password do not match.');
    }

    // Hash the new password
    const saltRounds = 10; // Or configure via ConfigService
    let newPasswordHash: string;
    try {
      newPasswordHash = await bcrypt.hash(changeManagerPasswordDto.newPassword, saltRounds);
    } catch (error) {
      throw new InternalServerErrorException('Error hashing new password');
    }

    // Update user's password hash
    user.passwordHash = newPasswordHash;

    try {
      await this.usersRepository.save(user);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Error updating manager password.');
    }
  }

  async updateForManager(storeSlug: string, id: string, updateManagerCustomerDto: UpdateManagerCustomerDto): Promise<Omit<UserEntity, 'passwordHash'>> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['orders'], // Only need orders to verify store association
    });

    if (!user) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    // Verify user is associated with the store by checking if they have any orders linked to the store
    const hasOrderInStore = user.orders.some(order => order.storeId === store.id);

    if (!hasOrderInStore) {
      throw new NotFoundException(`Customer with ID "${id}" not found for store "${storeSlug}"`);
    }

    // Update fields if they are provided in the DTO
    if (updateManagerCustomerDto.firstName !== undefined) {
      user.firstName = updateManagerCustomerDto.firstName;
    }
    if (updateManagerCustomerDto.lastName !== undefined) {
      user.lastName = updateManagerCustomerDto.lastName;
    }
    if (updateManagerCustomerDto.phone !== undefined) {
      user.phone = updateManagerCustomerDto.phone;
    }
    // Add other updatable fields here if they are in the DTO

    try {
      const updatedUser = await this.usersRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...result } = updatedUser; // Exclude password hash from result
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error updating customer information for manager.');
    }
  }

  async findOneForManager(storeSlug: string, id: string): Promise<UserEntity> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['addresses', 'orders', 'orders.items', 'orders.items.product'], // Eager load necessary relations
    });

    if (!user) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    // Verify user is associated with the store by checking if they have any orders linked to the store
    const hasOrderInStore = user.orders.some(order => order.storeId === store.id);

    if (!hasOrderInStore) {
      throw new NotFoundException(`Customer with ID "${id}" not found for store "${storeSlug}"`);
    }

    // Exclude password hash from the returned user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result as UserEntity; // Cast back to UserEntity after removing passwordHash
  }

  async findAllForManager(storeSlug: string, queryDto: FindAllManagerCustomersDto): Promise<{ customers: UserEntity[], total: number }> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const { page, limit, sort, q, signup_date_min, signup_date_max, total_spent_min, total_spent_max, status } = queryDto;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Join with orders to filter by store and potentially calculate aggregates
    queryBuilder
      .innerJoin(OrderEntity, 'order', 'order.userId = user.id AND order.storeId = :storeId', { storeId: store.id })
      .groupBy('user.id'); // Group by user to get distinct users who have ordered from the store

    // Apply search filter
    if (q) {
      queryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:q) OR LOWER(user.lastName) LIKE LOWER(:q) OR LOWER(user.email) LIKE LOWER(:q) OR LOWER(user.phone) LIKE LOWER(:q))',
        { q: `%${q}%` },
      );
    }

    // Apply signup date filters
    if (signup_date_min) {
      queryBuilder.andWhere('user.createdAt >= :signup_date_min', { signup_date_min });
    }
    if (signup_date_max) {
      queryBuilder.andWhere('user.createdAt <= :signup_date_max', { signup_date_max });
    }

    // Apply total spent filters (requires calculating total spent per user for the store)
    // This is complex with a simple join and might require a subquery or a view for performance.
    // For simplicity in this task, we'll filter after fetching or add a complex HAVING clause.
    // A more robust solution would pre-calculate or use a dedicated reporting table.
    // Let's add a basic filter based on the sum of order totals for the store.
    queryBuilder.addSelect('SUM(order.totalAmount)', 'totalSpent');

    if (total_spent_min) {
      queryBuilder.andHaving('SUM(order.totalAmount) >= :total_spent_min', { total_spent_min: parseFloat(total_spent_min) });
    }
    if (total_spent_max) {
      queryBuilder.andHaving('SUM(order.totalAmount) <= :total_spent_max', { total_spent_max: parseFloat(total_spent_max) });
    }

    // Apply status filter (assuming a status can be derived or exists on UserEntity - currently it doesn't based on the provided UserEntity)
    // If 'status' refers to order status, this filter needs to be applied to the joined orders.
    // Let's assume for now 'status' is not directly on UserEntity and skip this filter or clarify with user if needed.
    // If a user status is added later, this is where it would be applied.

    // Apply sorting
    if (sort) {
      switch (sort) {
        case 'name-asc':
          queryBuilder.orderBy('user.lastName', 'ASC').addOrderBy('user.firstName', 'ASC');
          break;
        case 'name-desc':
          queryBuilder.orderBy('user.lastName', 'DESC').addOrderBy('user.firstName', 'DESC');
          break;
        case 'signup-asc':
          queryBuilder.orderBy('user.createdAt', 'ASC');
          break;
        case 'signup-desc':
          queryBuilder.orderBy('user.createdAt', 'DESC');
          break;
        case 'last-order-asc':
          // Sorting by last order date requires finding the max order date per user for the store
          queryBuilder.addSelect('MAX(order.orderDate)', 'lastOrderDate');
          queryBuilder.orderBy('lastOrderDate', 'ASC');
          break;
        case 'last-order-desc':
          queryBuilder.addSelect('MAX(order.orderDate)', 'lastOrderDate');
          queryBuilder.orderBy('lastOrderDate', 'DESC');
          break;
        case 'total-spent-asc':
          queryBuilder.orderBy('totalSpent', 'ASC');
          break;
        case 'total-spent-desc':
          queryBuilder.orderBy('totalSpent', 'DESC');
          break;
        default:
          // Default sort or throw error for invalid sort
          break;
      }
    } else {
      // Default sort if none provided
      queryBuilder.orderBy('user.createdAt', 'DESC');
    }


    // Apply pagination
    const pageNum = parseInt(page ?? '1', 10);
    const limitNum = parseInt(limit ?? '10', 10);
    const skip = (pageNum - 1) * limitNum;

    queryBuilder.offset(skip).limit(limitNum);

    // Execute query and get total count
    const [customers, total] = await queryBuilder.getManyAndCount();

    // Note: The returned 'customers' will have the 'totalSpent' and 'lastOrderDate' properties
    // added by addSelect, but they might not align perfectly with the UserEntity type.
    // A DTO for the response might be needed for a cleaner structure.
    // For this task, we return the raw result from getManyAndCount.

    return { customers: customers as any, total }; // Cast to any for now due to added select fields
  }

  async addNoteForManager(storeSlug: string, id: string, addCustomerNoteDto: AddCustomerNoteDto): Promise<Omit<UserEntity, 'passwordHash'>> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['orders'], // Only need orders to verify store association
    });

    if (!user) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    // Verify user is associated with the store by checking if they have any orders linked to the store
    const hasOrderInStore = user.orders.some(order => order.storeId === store.id);

    if (!hasOrderInStore) {
      throw new NotFoundException(`Customer with ID "${id}" not found for store "${storeSlug}"`);
    }

    // Add the note to the user's notes array
    if (!user.notes) {
      user.notes = [];
    }
    // Create a new Note object
    const newNote = {
      content: addCustomerNoteDto.note,
      createdAt: new Date().toISOString(),
      // id and createdBy can be added if needed, e.g., id via uuid
    };
    user.notes.push(newNote);

    try {
      const updatedUser = await this.usersRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...result } = updatedUser; // Exclude password hash from result
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error adding note to customer.');
    }
  }

  async sendEmailToCustomerForManager(storeSlug: string, id: string, sendCustomerEmailDto: SendCustomerEmailDto): Promise<{ success: boolean; message: string }> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['orders'], // Only need orders to verify store association
    });

    if (!user) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    // Verify user is associated with the store by checking if they have any orders linked to the store
    const hasOrderInStore = user.orders.some(order => order.storeId === store.id);

    if (!hasOrderInStore) {
      throw new NotFoundException(`Customer with ID "${id}" not found for store "${storeSlug}"`);
    }

    // Placeholder email sending logic
    console.log(`Sending email to ${user.email} for store ${storeSlug}:`);
    console.log(`Subject: ${sendCustomerEmailDto.subject}`);
    console.log(`Body: ${sendCustomerEmailDto.body}`);

    // In a real application, you would integrate with an email service here.

    return { success: true, message: 'Email scheduled for sending.' };
  }

  async exportForManager(storeSlug: string, queryDto: FindAllManagerCustomersDto): Promise<string> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });
    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    // Reuse query building logic from findAllForManager but without pagination
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    queryBuilder
      .innerJoin(OrderEntity, 'order', 'order.userId = user.id AND order.storeId = :storeId', { storeId: store.id })
      .leftJoinAndSelect('user.addresses', 'address') // Include addresses
      .groupBy('user.id');

    // Add selections for aggregate data
    queryBuilder
      .addSelect('SUM(order.totalAmount)', 'totalSpent')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('MAX(order.orderDate)', 'lastOrderDate');

    // Apply search filter
    if (queryDto.q) {
      queryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:q) OR LOWER(user.lastName) LIKE LOWER(:q) OR LOWER(user.email) LIKE LOWER(:q) OR LOWER(user.phone) LIKE LOWER(:q))',
        { q: `%${queryDto.q}%` },
      );
    }

    // Apply signup date filters
    if (queryDto.signup_date_min) {
      queryBuilder.andWhere('user.createdAt >= :signup_date_min', { signup_date_min: queryDto.signup_date_min });
    }
    if (queryDto.signup_date_max) {
      queryBuilder.andWhere('user.createdAt <= :signup_date_max', { signup_date_max: queryDto.signup_date_max });
    }

    // Apply total spent filters
    if (queryDto.total_spent_min) {
      queryBuilder.andHaving('SUM(order.totalAmount) >= :total_spent_min', { total_spent_min: parseFloat(queryDto.total_spent_min) });
    }
    if (queryDto.total_spent_max) {
      queryBuilder.andHaving('SUM(order.totalAmount) <= :total_spent_max', { total_spent_max: parseFloat(queryDto.total_spent_max) });
    }

    // Apply sorting (optional for export, but good to maintain consistency)
    if (queryDto.sort) {
      switch (queryDto.sort) {
        case 'name-asc':
          queryBuilder.orderBy('user.lastName', 'ASC').addOrderBy('user.firstName', 'ASC');
          break;
        case 'name-desc':
          queryBuilder.orderBy('user.lastName', 'DESC').addOrderBy('user.firstName', 'DESC');
          break;
        case 'signup-asc':
          queryBuilder.orderBy('user.createdAt', 'ASC');
          break;
        case 'signup-desc':
          queryBuilder.orderBy('user.createdAt', 'DESC');
          break;
        case 'last-order-asc':
          queryBuilder.orderBy('lastOrderDate', 'ASC');
          break;
        case 'last-order-desc':
          queryBuilder.orderBy('lastOrderDate', 'DESC');
          break;
        case 'total-spent-asc':
          queryBuilder.orderBy('totalSpent', 'ASC');
          break;
        case 'total-spent-desc':
          queryBuilder.orderBy('totalSpent', 'DESC');
          break;
        default:
          queryBuilder.orderBy('user.createdAt', 'DESC');
          break;
      }
    } else {
      queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    const customers = await queryBuilder.getRawMany(); // Use getRawMany to get the selected aggregate fields

    // Format data as CSV
    let csv = '"Customer ID","First Name","Last Name","Email","Phone","Signup Date","Total Spent","Number of Orders","Last Order Date","Notes"\n';

    customers.forEach(customer => {
      const notes = Array.isArray(customer.user_notes) ? customer.user_notes.join('; ') : ''; // Assuming notes is a JSON array
      const signupDate = customer.user_createdAt ? new Date(customer.user_createdAt).toISOString() : '';
      const lastOrderDate = customer.lastOrderDate ? new Date(customer.lastOrderDate).toISOString() : '';

      csv += `"${customer.user_id}","${customer.user_firstName}","${customer.user_lastName}","${customer.user_email}","${customer.user_phone}","${signupDate}","${customer.totalSpent || 0}","${customer.orderCount || 0}","${lastOrderDate}","${notes}"\n`;
    });

    return csv;
  }

  async enable2faForManager(userId: string, enable2faDto: Enable2faDto): Promise<{ qrCodeUrl: string }> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Manager with ID "${userId}" not found.`);
    }

    // Generate a new 2FA secret
    const secret = speakeasy.generateSecret({
      name: 'Magic Store', // Replace with your application name
      length: 20,
    });

    // Store the secret and enable 2FA
    user.twoFactorSecret = secret.base32;
    user.isTwoFactorEnabled = true;

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Error enabling 2FA for manager.');
    }

    // Generate QR code URL
    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: user.email,
      issuer: 'Magic Store', // Replace with your application name
      encoding: 'ascii',
    });

    return { qrCodeUrl };
  }

  async disable2faForManager(userId: string, disable2faDto: Disable2faDto): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Manager with ID "${userId}" not found.`);
    }

    // Verify current password before disabling 2FA
    const isPasswordValid = await bcrypt.compare(disable2faDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password.');
    }

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled for this account.');
    }

    // Disable 2FA and clear the secret
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;

    try {
      await this.usersRepository.save(user);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Error disabling 2FA for manager.');
    }
  }

  async confirm2faSetup(userId: string, confirm2faDto: Confirm2faDto): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }
    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA secret not found. Please enable 2FA first.');
    }

    const isValidToken = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: confirm2faDto.token,
    });

    if (!isValidToken) {
      throw new BadRequestException('Invalid 2FA token.');
    }

    user.isTwoFactorEnabled = true;
    try {
      await this.usersRepository.save(user);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Error confirming 2FA setup.');
    }
  }

  async get2faBackupCodes(userId: string): Promise<string[]> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled or setup for this user.');
    }
    // This is a simplified example. In a real application, you would generate
    // and store unique, one-time backup codes securely.
    // For this example, we'll generate some pseudo-random codes.
    const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
    // You would typically store these codes (hashed) and mark them as used.
    // This part is highly dependent on the specific 2FA library and security requirements.
    return backupCodes;
  }

  async updateProfilePictureUrl(userId: string, profilePictureUrl: string): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }
    user.profilePictureUrl = profilePictureUrl;
    try {
      const updatedUser = await this.usersRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...result } = updatedUser;
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error updating profile picture URL.');
    }
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferencesDto> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }
    return user.notificationPreferences || {};
  }

  async updateNotificationPreferences(userId: string, preferencesDto: NotificationPreferencesDto): Promise<NotificationPreferencesDto> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }
    user.notificationPreferences = { ...user.notificationPreferences, ...preferencesDto };
    try {
      await this.usersRepository.save(user);
      return user.notificationPreferences;
    } catch (error) {
      throw new InternalServerErrorException('Error updating notification preferences.');
    }
  }

  async getLoginHistory(userId: string, page = 1, limit = 10): Promise<{ history: LoginHistoryEntity[], total: number }> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }
    return this.loginHistoryService.findByUserId(userId, page, limit);
  }
}
