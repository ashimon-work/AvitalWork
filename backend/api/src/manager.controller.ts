import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Body,
  Patch,
  Get,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { StoreContextGuard } from './core/guards/store-context.guard';
import { ProductsService } from './products/products.service';
import { OrdersService } from './orders/orders.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateOrderStatusDto } from './orders/dto/update-order-status.dto';
import { ManagerService } from './manager/manager.service';
import { ReportErrorDto } from './manager/dto/report-error.dto';
import { SettingsService } from './settings/settings.service';
import { LoginHistoryService } from './login-history/login-history.service';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('manager/:storeSlug')
export class ManagerController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly managerService: ManagerService,
    private readonly settingsService: SettingsService,
    private readonly loginHistoryService: LoginHistoryService,
  ) {}

  @Post('products/import')
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(
    @Param('storeSlug') storeSlug: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // For simplicity, allowing any file type for now,
          // but in a real scenario, you'd validate CSV or expected file type
          // new FileTypeValidator({ fileType: 'text/csv' }),
          // new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
        ],
        // If no file is uploaded, this will throw an error.
        // If file is optional, you'd adjust this.
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.productsService.importForManager(storeSlug, file);
  }

  @Patch('orders/:id/status') // New endpoint for updating order status
  async updateOrderStatus(
    @Param('storeSlug') storeSlug: string,
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatusForManager(
      storeSlug,
      orderId,
      updateOrderStatusDto,
    );
  }
  @Post('error-report')
  async reportError(@Body() reportErrorDto: ReportErrorDto) {
    return this.managerService.reportErrorForManager(reportErrorDto);
  }

  @Get('settings/:category')
  async getSettingsByCategory(
    @Param('storeSlug') storeSlug: string,
    @Param('category') category: string,
  ) {
    return this.settingsService.getSettingsByCategory(storeSlug, category);
  }

  @Get('profile/login-history')
  async getLoginHistory(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.loginHistoryService.getLoginHistoryForManager(userId);
  }
}
