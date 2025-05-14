import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginHistoryEntity } from './entities/login-history.entity';

@Injectable()
export class LoginHistoryService {
  constructor(
    @InjectRepository(LoginHistoryEntity)
    private loginHistoryRepository: Repository<LoginHistoryEntity>,
  ) {}

  async getLoginHistoryForManager(userId: string): Promise<LoginHistoryEntity[]> {
    return this.loginHistoryRepository.find({
      where: { userId },
      order: { loginTime: 'DESC' },
    });
  }

  async findByUserId(userId: string, page = 1, limit = 10): Promise<{ history: LoginHistoryEntity[], total: number }> {
    const [history, total] = await this.loginHistoryRepository.findAndCount({
      where: { userId },
      order: { loginTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { history, total };
  }
}