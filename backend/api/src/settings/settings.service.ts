import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { TestEmailDto } from './dto/test-email.dto';
import { TestPaymentDto } from './dto/test-payment.dto';
import { RestoreSettingsDto } from './dto/restore-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
    @InjectRepository(StoreEntity)
    private storeRepository: Repository<StoreEntity>,
  ) {}

  async getSettingsByCategory(storeSlug: string, category: string): Promise<Setting[]> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    return this.settingsRepository.find({
      where: {
        store: { id: store.id },
        category: category,
      },
    });
  }

  async updateSettingsByCategory(
    storeSlug: string,
    category: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<Setting[]> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const updatedSettings: Setting[] = [];

    for (const key in updateSettingsDto) {
      if (updateSettingsDto.hasOwnProperty(key)) {
        const value = updateSettingsDto[key];

        let setting = await this.settingsRepository.findOne({
          where: {
            store: { id: store.id },
            category: category,
            key: key,
          },
        });

        if (setting) {
          // Update existing setting
          setting.value = value;
          await this.settingsRepository.save(setting);
          updatedSettings.push(setting);
        } else {
          // Create new setting
          setting = this.settingsRepository.create({
            store: store,
            category: category,
            key: key,
            value: value,
          });
            await this.settingsRepository.save(setting);
            updatedSettings.push(setting);
        }
      }
    }

    return updatedSettings;
  }

  async resetSettingsByCategory(storeSlug: string, category: string): Promise<{ success: boolean; message: string }> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    // In a real application, you would have default settings defined somewhere
    // For this example, we'll just delete the settings for this category
    const deleteResult = await this.settingsRepository.delete({
      store: { id: store.id },
      category: category,
    });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return { success: true, message: `Settings for category "${category}" have been reset.` };
    } else {
      return { success: false, message: `No settings found for category "${category}" to reset or reset failed.` };
    }
  }

  async testEmail(storeSlug: string, testEmailDto: TestEmailDto): Promise<{ success: boolean; message: string }> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    // Retrieve email configuration settings for the store (placeholder)
    // In a real implementation, you would fetch settings like SMTP host, port, user, password, etc.
    const emailSettings = await this.settingsRepository.find({
      where: {
        store: { id: store.id },
        category: 'email', // Assuming 'email' is the category for email settings
      },
    });

    console.log(`Simulating sending test email for store "${storeSlug}"`);
    console.log(`Recipient: ${testEmailDto.recipientEmail}`);
    console.log('Email Configuration:', emailSettings);

    // Placeholder for actual email sending logic
    // const success = await sendEmail(testEmailDto.recipientEmail, emailSettings);

    return { success: true, message: 'Test email simulation successful.' };
  }

  async testPayment(storeSlug: string, testPaymentDto: TestPaymentDto): Promise<{ success: boolean; message: string }> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    // Retrieve payment configuration settings for the store (placeholder)
    // In a real implementation, you would fetch settings like API keys, endpoint URLs, etc.
    const paymentSettings = await this.settingsRepository.find({
      where: {
        store: { id: store.id },
        category: 'payment', // Assuming 'payment' is the category for payment settings
      },
    });

    console.log(`Simulating testing payment configuration for store "${storeSlug}"`);
    console.log(`Amount: ${testPaymentDto.amount}, Currency: ${testPaymentDto.currency}`);
    console.log('Payment Configuration:', paymentSettings);

    // Placeholder for actual payment gateway testing logic
    // const success = await testPayment(store, paymentSettings, testPaymentDto);

    return { success: true, message: 'Test payment simulation successful.' };
  }

  async backupSettings(storeSlug: string): Promise<string> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    const settings = await this.settingsRepository.find({
      where: { store: { id: store.id } },
    });

    // Format settings by category
    const backupData: { [category: string]: any } = {};
    settings.forEach(setting => {
      if (!backupData[setting.category]) {
        backupData[setting.category] = [];
      }
      backupData[setting.category].push({ key: setting.key, value: setting.value });
    });

    return JSON.stringify(backupData, null, 2);
  }

  async restoreSettings(storeSlug: string, restoreSettingsDto: RestoreSettingsDto): Promise<{ success: boolean; message: string }> {
    const store = await this.storeRepository.findOne({ where: { slug: storeSlug } });

    if (!store) {
      throw new NotFoundException(`Store with slug "${storeSlug}" not found`);
    }

    // Delete existing settings for the store
    await this.settingsRepository.delete({ store: { id: store.id } });

    // Create new settings from backup data
    const settingsToCreate: Setting[] = [];
    if (restoreSettingsDto && restoreSettingsDto.settings) {
      for (const settingItem of restoreSettingsDto.settings) {
        if (settingItem.key && settingItem.value !== undefined && settingItem.category) {
          settingsToCreate.push(this.settingsRepository.create({
            store: store,
            category: settingItem.category,
            key: settingItem.key,
            value: settingItem.value,
          }));
        }
      }
    }

    if (settingsToCreate.length > 0) {
      await this.settingsRepository.save(settingsToCreate);
    }

    return { success: true, message: `Settings for store "${storeSlug}" restored successfully.` };
  }
}