import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { TestEmailDto } from './dto/test-email.dto';
import { TestPaymentDto } from './dto/test-payment.dto';
import { RestoreSettingsDto } from './dto/restore-settings.dto';

@Controller('manager/:storeSlug/settings')
@UseGuards(JwtAuthGuard) // Assuming authentication is needed
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // API Endpoints for Settings Categories
  @Get(':category')
  async getSettings(
    @Param('storeSlug') storeSlug: string,
    @Param('category') category: string,
  ) {
    // TODO: Implement logic to fetch settings by category
    return this.settingsService.getSettingsByCategory(storeSlug, category);
  }

  @Put(':category')
  async updateSettings(
    @Param('storeSlug') storeSlug: string,
    @Param('category') category: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    // TODO: Implement logic to update settings by category
    return this.settingsService.updateSettingsByCategory(
      storeSlug,
      category,
      updateSettingsDto,
    );
  }

  @Post(':category/reset')
  async resetSettings(
    @Param('storeSlug') storeSlug: string,
    @Param('category') category: string,
  ) {
    // TODO: Implement logic to reset settings by category
    return this.settingsService.resetSettingsByCategory(storeSlug, category);
  }

  // API Endpoints for General Settings Actions
  @Post('test-email')
  async testEmail(
    @Param('storeSlug') storeSlug: string,
    @Body() testEmailDto: TestEmailDto,
  ) {
    // TODO: Implement logic to send a test email
    return this.settingsService.testEmail(storeSlug, testEmailDto);
  }
  @Post('test-payment')
  async testPayment(
    @Param('storeSlug') storeSlug: string,
    @Body() testPaymentDto: TestPaymentDto,
  ) {
    // TODO: Implement logic to test payment
    return this.settingsService.testPayment(storeSlug, testPaymentDto);
  }

  @Get('backup')
  @Get('backup')
  async backupSettings(@Param('storeSlug') storeSlug: string) {
    // TODO: Implement logic to backup settings
    return this.settingsService.backupSettings(storeSlug);
  }

  @Post('restore')
  async restoreSettings(
    @Param('storeSlug') storeSlug: string,
    @Body() restoreSettingsDto: RestoreSettingsDto,
  ) {
    // TODO: Implement logic to restore settings
    return this.settingsService.restoreSettings(storeSlug, restoreSettingsDto);
  }
}
