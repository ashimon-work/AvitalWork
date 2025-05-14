import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginHistoryService } from './login-history.service';
import { LoginHistoryEntity } from './entities/login-history.entity';

@Module({
    imports: [TypeOrmModule.forFeature([LoginHistoryEntity])],
    providers: [LoginHistoryService],
    exports: [LoginHistoryService],
})
export class LoginHistoryModule { }