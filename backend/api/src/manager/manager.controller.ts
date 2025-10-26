import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Req,
  Patch,
  Delete,
  Header,
  Res,
  UseInterceptors,
  UploadedFile,
  Put,
  BadRequestException,
} from '@nestjs/common'; // Added Put, UseInterceptors, UploadedFile, BadRequestException
import { FileInterceptor } from '@nestjs/platform-express'; // Added
import { Response } from 'express';
import { SendCustomerEmailDto } from 'src/users/dto/send-customer-email.dto';
import { ManagerService } from './manager.service';
import { SettingsService } from '../settings/settings.service';
import { UpdateSettingsDto } from '../settings/dto/update-settings.dto';
import { TestEmailDto } from '../settings/dto/test-email.dto';
import { TestPaymentDto } from '../settings/dto/test-payment.dto';
import { LoginManagerDto } from '../auth/dto/login-manager.dto';
import { AuthService } from '../auth/auth.service';
import { ProductsService } from '../products/products.service';
import { FindAllManagerProductsDto } from '../products/dto/find-all-manager-products.dto';
import { ProductDto } from '../products/dto/product.dto';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreContextGuard } from '../core/guards/store-context.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { BulkDeleteProductsDto } from 'src/products/dto/bulk-delete-products.dto';
import { BulkUpdateProductStatusDto } from 'src/products/dto/bulk-update-product-status.dto';
import { FindAllManagerOrdersDto } from 'src/orders/dto/find-all-manager-orders.dto';
import { OrderDto } from 'src/orders/dto/order.dto'; // Ensure OrderDto is imported
import { OrdersService } from 'src/orders/orders.service';
import { AddOrderNoteDto } from 'src/orders/dto/add-order-note.dto';
import { SendOrderEmailDto } from 'src/orders/dto/SendOrderEmailDto';
import { AddOrderShippingDto } from 'src/orders/dto/add-order-shipping.dto';
import { FindAllManagerCustomersDto } from 'src/users/dto/find-all-manager-customers.dto';
import { UpdateManagerCustomerDto } from 'src/users/dto/update-manager-customer.dto';
import { UsersService } from 'src/users/users.service';
import { AddCustomerNoteDto } from 'src/users/dto/add-customer-note.dto';
import { RestoreSettingsDto } from 'src/settings/dto/restore-settings.dto';
import { UpdatePersonalInfoDto } from 'src/users/dto/update-personal-info.dto';
import { ChangeManagerPasswordDto } from 'src/users/dto/change-manager-password.dto';
import { Enable2faDto } from 'src/users/dto/enable-2fa.dto';
import { Confirm2faDto } from 'src/users/dto/confirm-2fa.dto'; // Added
import { NotificationPreferencesDto } from 'src/users/dto/notification-preferences.dto'; // Added
import { Disable2faDto } from 'src/users/dto/disable-2fa.dto';

@UseGuards(JwtAuthGuard)
@Controller('manager')
export class ManagerController {
  constructor(
    private readonly managerService: ManagerService,
    private readonly authService: AuthService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get('profile')
  async getManagerProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.usersService.getManagerProfile(userId);
  }

  @Patch('profile')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateManagerProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updatePersonalInfoDto: UpdatePersonalInfoDto,
  ) {
    const userId = req.user.id;
    return this.usersService.updatePersonalInfo(userId, updatePersonalInfoDto);
  }

  @Post('profile/password')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async changeManagerPassword(
    @Req() req: AuthenticatedRequest,
    @Body() changeManagerPasswordDto: ChangeManagerPasswordDto,
  ) {
    const userId = req.user.id;
    return this.usersService.changeManagerPassword(
      userId,
      changeManagerPasswordDto,
    );
  }

  @Post('profile/2fa/enable')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async enable2fa(
    @Req() req: AuthenticatedRequest,
    @Body() enable2faDto: Enable2faDto,
  ) {
    const userId = req.user.id;
    return this.usersService.enable2faForManager(userId, enable2faDto);
  }

  @Post('profile/2fa/disable')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async disable2fa(
    @Req() req: AuthenticatedRequest,
    @Body() disable2faDto: Disable2faDto,
  ) {
    const userId = req.user.id;
    return this.usersService.disable2faForManager(userId, disable2faDto);
  }

  @Post('profile/2fa/confirm')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async confirm2faSetup(
    @Req() req: AuthenticatedRequest,
    @Body() confirm2faDto: Confirm2faDto,
  ) {
    const userId = req.user.id;
    return this.usersService.confirm2faSetup(userId, confirm2faDto);
  }

  @Get('profile/2fa/backup-codes')
  async get2faBackupCodes(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.usersService.get2faBackupCodes(userId);
  }

  @Post('profile/picture')
  @UseInterceptors(FileInterceptor('profilePicture')) // 'profilePicture' is the field name in the form-data
  async uploadProfilePicture(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    // In a real application, you would save the file to a storage service (S3, GCS, etc.)
    // and get back a URL. For this example, we'll assume a placeholder URL.
    // You might also want to validate file type, size, etc.
    if (!file) {
      throw new BadRequestException('Profile picture file is required.');
    }
    const profilePictureUrl = `/uploads/profile-pictures/${userId}/${file.filename}`; // Placeholder
    // Ensure the 'uploads/profile-pictures' directory exists or handle file storage appropriately.
    // This is a simplified example.
    return this.usersService.updateProfilePictureUrl(userId, profilePictureUrl);
  }

  @Get('profile/notification-preferences')
  async getNotificationPreferences(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.usersService.getNotificationPreferences(userId);
  }

  @Put('profile/notification-preferences')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateNotificationPreferences(
    @Req() req: AuthenticatedRequest,
    @Body() notificationPreferencesDto: NotificationPreferencesDto,
  ) {
    const userId = req.user.id;
    return this.usersService.updateNotificationPreferences(
      userId,
      notificationPreferencesDto,
    );
  }

  @Get('profile/login-history')
  async getLoginHistory(
    @Req() req: AuthenticatedRequest,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user.id;
    const pageNum = parseInt(page as any, 10);
    const limitNum = parseInt(limit as any, 10);
    return this.usersService.getLoginHistory(userId, pageNum, limitNum);
  }

  @UseGuards(StoreContextGuard)
  @Get(':storeSlug/dashboard')
  getDashboardData(@Param('storeSlug') storeSlug: string) {
    return this.managerService.getDashboardData(storeSlug);
  }

  @Get(':storeSlug/orders/recent')
  getRecentOrders(
    @Param('storeSlug') storeSlug: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sortColumn') sortColumn = 'createdAt',
    @Query('sortDirection') sortDirection: 'asc' | 'desc' = 'desc',
  ) {
    const pageNum = parseInt(page as any, 10);
    const limitNum = parseInt(limit as any, 10);

    return this.managerService.getRecentOrders(
      storeSlug,
      pageNum,
      limitNum,
      sortColumn,
      sortDirection,
    );
  }

  @Get(':storeSlug/sales/chart')
  getSalesChartData(
    @Param('storeSlug') storeSlug: string,
    @Query('period') period: string,
  ) {
    return this.managerService.getSalesChartData(storeSlug, period);
  }

  @Get(':storeSlug/inventory/alerts')
  getInventoryAlerts(@Param('storeSlug') storeSlug: string) {
    return this.managerService.getInventoryAlerts(storeSlug);
  }

  @Get(':storeSlug/products')
  async findAllProductsForManager(
    @Req() req: AuthenticatedRequest,
    @Param('storeSlug') storeSlug: string,
    @Query() queryParams: FindAllManagerProductsDto,
  ): Promise<{ products: ProductDto[]; total: number }> {
    const serviceParams = {
      ...queryParams,
      page: queryParams.page ? parseInt(queryParams.page, 10) : undefined,
      limit: queryParams.limit ? parseInt(queryParams.limit, 10) : undefined,
      price_min: queryParams.price_min
        ? parseFloat(queryParams.price_min)
        : undefined,
      price_max: queryParams.price_max
        ? parseFloat(queryParams.price_max)
        : undefined,
      isActive: queryParams.isActive
        ? queryParams.isActive === 'true'
        : undefined,
      storeSlug: storeSlug,
    };

    const { products, total } =
      await this.productsService.findAll(serviceParams);

    const productDtos: ProductDto[] = products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrls: product.imageUrls,
      categoryIds: product.categories
        ? product.categories.map((cat) => cat.id)
        : [],
      store: product.store,
      categories: product.categories || [],
      tags: product.tags,
      stockLevel: product.stockLevel,
      isActive: product.isActive,
      isFeaturedInMarketplace: product.isFeaturedInMarketplace,
      options: product.options,
      variants: product.variants
        ? product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            options: variant.options,
            price: variant.price,
            stockLevel: variant.stockLevel,
            imageUrl: variant.imageUrl,
          }))
        : [],
    }));

    return { products: productDtos, total };
  }
  @Get(':storeSlug/products/:id')
  async findOneProductForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOneForManager(storeSlug, id);
  }

  @Get(':storeSlug/customers/:id')
  async findOneCustomerForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
  ) {
    return this.usersService.findOneForManager(storeSlug, id);
  }

  @Patch(':storeSlug/customers/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateCustomerForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
    @Body() updateManagerCustomerDto: UpdateManagerCustomerDto,
  ) {
    return this.usersService.updateForManager(
      storeSlug,
      id,
      updateManagerCustomerDto,
    );
  }

  @Post(':storeSlug/customers/:id/notes')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async addCustomerNoteForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
    @Body() addCustomerNoteDto: AddCustomerNoteDto,
  ) {
    return this.usersService.addNoteForManager(
      storeSlug,
      id,
      addCustomerNoteDto,
    );
  }

  @Post(':storeSlug/customers/:id/email')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async sendCustomerEmailForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
    @Body() sendCustomerEmailDto: SendCustomerEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.usersService.sendEmailToCustomerForManager(
      storeSlug,
      id,
      sendCustomerEmailDto,
    );
  }

  @Get(':storeSlug/customers/:customerId/orders')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async getCustomerOrderHistory(
    @Param('storeSlug') storeSlug: string,
    @Param('customerId') customerId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortDirection') sortDirection: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ orders: OrderDto[]; total: number }> {
    const pageNum = parseInt(page as any, 10);
    const limitNum = parseInt(limit as any, 10);
    // We'll need a new service method in OrdersService for this
    return this.ordersService.findAllForCustomerInStore(storeSlug, customerId, {
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortDirection,
    });
  }

  @Post(':storeSlug/products')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createProductForManager(
    @Param('storeSlug') storeSlug: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.createForManager(storeSlug, createProductDto);
  }
  @Patch(':storeSlug/products/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateProductForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateForManager(
      storeSlug,
      id,
      updateProductDto,
    );
  }

  @Delete(':storeSlug/products/:id')
  async deleteProductForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
  ) {
    return this.productsService.deleteForManager(storeSlug, id);
  }
  @Post(':storeSlug/products/bulk-delete')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async bulkDeleteProductsForManager(
    @Param('storeSlug') storeSlug: string,
    @Body() bulkDeleteProductsDto: BulkDeleteProductsDto,
  ) {
    return this.productsService.bulkDeleteForManager(
      storeSlug,
      bulkDeleteProductsDto.productIds,
    );
  }
  @Post(':storeSlug/products/bulk-update-status')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async bulkUpdateProductStatusForManager(
    @Param('storeSlug') storeSlug: string,
    @Body() bulkUpdateProductStatusDto: BulkUpdateProductStatusDto,
  ) {
    return this.productsService.bulkUpdateStatusForManager(
      storeSlug,
      bulkUpdateProductStatusDto.productIds,
      bulkUpdateProductStatusDto.status,
    );
  }
  @Get(':storeSlug/orders')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async findAllOrdersForManager(
    @Param('storeSlug') storeSlug: string,
    @Query() queryParams: FindAllManagerOrdersDto,
  ): Promise<{ orders: OrderDto[]; total: number }> {
    return this.ordersService.findAllForManager(storeSlug, queryParams);
  }

  @Get(':storeSlug/orders/:id')
  async findOneOrderForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
  ): Promise<OrderDto> {
    return this.ordersService.findOneForManager(storeSlug, id);
  }

  @Post(':storeSlug/orders/:id/notes')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async addOrderNoteForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
    @Body() addOrderNoteDto: AddOrderNoteDto,
  ): Promise<OrderDto> {
    return this.ordersService.addNoteForManager(storeSlug, id, addOrderNoteDto);
  }

  @Post(':storeSlug/orders/:id/email')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async sendOrderEmailForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
    @Body() sendOrderEmailDto: SendOrderEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.ordersService.sendEmailToCustomerForManager(
      storeSlug,
      id,
      sendOrderEmailDto,
    );
  }

  @Post(':storeSlug/orders/:id/shipping')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async addOrderShippingForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
    @Body() addOrderShippingDto: AddOrderShippingDto,
  ): Promise<OrderDto> {
    return this.ordersService.addShippingForManager(
      storeSlug,
      id,
      addOrderShippingDto,
    );
  }
  @Get(':storeSlug/orders/:id/packing-slip')
  @HttpCode(HttpStatus.OK)
  async generatePackingSlipForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
  ): Promise<string> {
    // Set Content-Type header for plain text
    // NestJS will handle setting the header based on the return type and framework adapter
    // For explicit control, you could inject @Res() and set headers manually,
    // but returning the string is usually sufficient for basic types.
    // If returning HTML, NestJS will likely set Content-Type to text/html.
    // If returning a file/stream, more explicit header setting might be needed.
    // For a simple text/html string, returning the string is fine.

    return this.ordersService.generatePackingSlipForManager(storeSlug, id);
  }

  @Patch(':storeSlug/orders/:id/cancel')
  async cancelOrderForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
  ): Promise<OrderDto> {
    return this.ordersService.cancelOrderForManager(storeSlug, id);
  }

  @Patch(':storeSlug/orders/:orderId/fulfill')
  @HttpCode(HttpStatus.OK)
  async markOrderAsFulfilledForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('orderId') orderId: string,
  ): Promise<OrderDto> {
    return this.ordersService.markOrderAsFulfilledForManager(
      storeSlug,
      orderId,
    );
  }

  @Get(':storeSlug/orders/:orderId/shipping-label')
  @HttpCode(HttpStatus.OK)
  async requestShippingLabelForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('orderId') orderId: string,
  ): Promise<{ message: string }> {
    // Placeholder implementation
    console.log(
      `Shipping label requested for order ${orderId} in store ${storeSlug}`,
    );
    return this.ordersService.requestShippingLabelForManager(
      storeSlug,
      orderId,
    );
  }

  @Get(':storeSlug/orders/export')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="orders.csv"')
  async exportOrdersForManager(
    @Param('storeSlug') storeSlug: string,
    @Query() queryParams: FindAllManagerOrdersDto, // Reuse the DTO for filtering/sorting
  ): Promise<string> {
    return this.ordersService.exportForManager(storeSlug, queryParams);
  }

  @Get(':storeSlug/products/export')
  @HttpCode(HttpStatus.OK)
  async exportProductsForManager(
    @Param('storeSlug') storeSlug: string,
    // Add filtering/sorting query params here if needed in the future
  ) {
    const csvData = await this.productsService.exportForManager(storeSlug);

    // Set headers for file download
    // Note: NestJS handles setting Content-Type based on the returned data type by default,
    // but explicitly setting it here is clearer for a file download.
    // The 'attachment' disposition prompts the browser to download the file.
    // The filename can be dynamically generated, e.g., including the store slug and date.
    // For simplicity, using a static filename for now.
    // The response object is available via @Res() decorator if more control is needed,
    // but returning the data directly with headers set by NestJS is often sufficient.

    // NestJS will automatically set Content-Type to text/csv if we return a string and set the header.
    // We need to set Content-Disposition manually.
    // This requires injecting the Response object or using a library like 'express' directly.
    // A simpler approach in NestJS is to return a stream or buffer, but for a basic CSV string,
    // we can rely on NestJS's default handling combined with setting the header.

    // Let's try returning the string and setting the header via @Res()
    // Need to import @Res() and Response from express
    // import { Response } from 'express';
    // @Res() res: Response

    // Alternative: Return the string and let NestJS handle it, relying on the client to handle the download.
    // This is simpler for a basic implementation. Let's stick to this for now.

    // Let's try setting headers using @Header() decorator or manually in the method.
    // @Header('Content-Type', 'text/csv')
    // @Header('Content-Disposition', 'attachment; filename="products.csv"')
    // This requires importing @Header from @nestjs/common

    // Let's use the @Header decorator approach as it's cleaner with NestJS.
    // Need to add @Header imports at the top.

    // Re-reading the file to add @Header import
    // No, I can just add the import in the diff.

    // Let's add the @Header import and the endpoint method.

    return csvData;
  }

  @Get(':storeSlug/customers')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async findAllCustomersForManager(
    @Param('storeSlug') storeSlug: string,
    @Query() queryParams: FindAllManagerCustomersDto,
  ): Promise<{ customers: any[]; total: number }> {
    // Use any[] for now due to added select fields in service
    return this.usersService.findAllForManager(storeSlug, queryParams);
  }

  @Get(':storeSlug/customers/export')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="customers.csv"')
  async exportCustomersForManager(
    @Param('storeSlug') storeSlug: string,
    @Query() queryParams: FindAllManagerCustomersDto, // Reuse the DTO for filtering/sorting
  ): Promise<string> {
    return this.usersService.exportForManager(storeSlug, queryParams);
  }

  @Get(':storeSlug/settings/:category')
  async getSettingsByCategoryForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('category') category: string,
  ) {
    return this.settingsService.getSettingsByCategory(storeSlug, category);
  }

  @Patch(':storeSlug/settings/:category')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateSettingsByCategoryForManager(
    @Param('storeSlug') storeSlug: string,
    @Param('category') category: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettingsByCategory(
      storeSlug,
      category,
      updateSettingsDto,
    );
  }

  @Post(':storeSlug/settings/test-email')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async testEmailConfigurationForManager(
    @Param('storeSlug') storeSlug: string,
    @Body() testEmailDto: TestEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.settingsService.testEmail(storeSlug, testEmailDto);
  }

  @Post(':storeSlug/settings/test-payment')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async testPaymentConfigurationForManager(
    @Param('storeSlug') storeSlug: string,
    @Body() testPaymentDto: TestPaymentDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.settingsService.testPayment(storeSlug, testPaymentDto);
  }
  @Get(':storeSlug/settings/backup')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="settings_backup.json"')
  async downloadSettingsBackupForManager(
    @Param('storeSlug') storeSlug: string,
  ): Promise<string> {
    return this.settingsService.backupSettings(storeSlug);
  }

  @Post(':storeSlug/settings/restore')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async restoreSettingsForManager(
    @Param('storeSlug') storeSlug: string,
    @Body() restoreSettingsDto: RestoreSettingsDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.settingsService.restoreSettings(storeSlug, restoreSettingsDto);
  }
}
