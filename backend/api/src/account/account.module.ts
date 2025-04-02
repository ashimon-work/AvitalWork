import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if guards/strategies are needed here (often not directly)

@Module({
  imports: [AuthModule], // Import AuthModule to ensure Passport/JWT setup is available application-wide
  controllers: [AccountController],
  providers: [], // Add services specific to account management later
})
export class AccountModule {}