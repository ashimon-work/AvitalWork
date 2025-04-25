import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto'; // We'll create this DTO

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

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

  // Method specifically for updating the password hash
  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    const result = await this.usersRepository.update(userId, { passwordHash: newPasswordHash });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${userId}" not found for password update.`);
    }
  }
}
