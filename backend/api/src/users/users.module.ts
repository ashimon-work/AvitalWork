import { Module } from '@nestjs/common';
import { LoginHistoryModule } from '../login-history/login-history.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { StoreEntity } from 'src/stores/entities/store.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, StoreEntity]),
    LoginHistoryModule,
  ],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService so other modules can use it
})
export class UsersModule {}
