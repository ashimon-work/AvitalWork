import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseUUIDPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming this guard exists
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface'; // Assuming this interface exists

@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@Controller('notifications') // Base path could be 'manager/:storeSlug/notifications' if store-specific
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // This endpoint might be more for internal system use or specific admin roles
  // rather than general manager creation of arbitrary notifications.
  // For now, let's assume it's for creating notifications programmatically.
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @Req() req: AuthenticatedRequest) {
    // Ensure the notification being created is for the authenticated user or handle permissions
    // For simplicity, if createNotificationDto.userId is not the logged-in user, it might be an admin action.
    // Or, more typically, the userId in DTO should match req.user.id or be set by the system.
    // For now, we'll assume the DTO's userId is authoritative for creation if provided,
    // otherwise default to logged-in user. This needs careful security review based on actual use case.
    if (!createNotificationDto.userId) {
        createNotificationDto.userId = req.user.id;
    }
    // Add authorization logic here if a user can create notifications for another user.
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest, @Query('storeSlug') storeSlug?: string) {
    // storeSlug can be used if notifications are tied to a specific store context for a manager
    return this.notificationsService.findAllForUser(req.user.id, storeSlug);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.notificationsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.notificationsService.update(id, req.user.id, updateNotificationDto);
  }

  @Post('mark-all-as-read')
  markAllAsRead(@Req() req: AuthenticatedRequest, @Query('storeSlug') storeSlug?: string) {
    return this.notificationsService.markAllAsRead(req.user.id, storeSlug);
  }

  @Delete('clear-all') // Consider if this should be a POST for bulk operations
  clearAll(@Req() req: AuthenticatedRequest, @Query('storeSlug') storeSlug?: string) {
    return this.notificationsService.removeAllForUser(req.user.id, storeSlug);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.notificationsService.remove(id, req.user.id);
  }
}