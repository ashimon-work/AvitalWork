import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { StoreContextGuard } from '../core/guards/store-context.guard'; // Assuming a guard to get storeId

// Define the shape of the request object after JWT validation
interface AuthenticatedRequest extends Request {
  user: Omit<UserEntity, 'passwordHash'>;
  storeId?: string; // Added by StoreContextGuard
}

@UseGuards(JwtAuthGuard, StoreContextGuard) // Apply guards to all routes
@Controller('account/wishlist') // Route prefix: /api/account/wishlist (relative to store context)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const storeId = req.storeId; // Get storeId from guard
    if (!storeId) {
      throw new Error('Store context not found'); // Should be handled by guard
    }
    return this.wishlistService.getWishlistForUser(userId, storeId);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  addItem(
    @Request() req: AuthenticatedRequest,
    @Body() addWishlistItemDto: AddWishlistItemDto,
  ) {
    const userId = req.user.id;
    const storeId = req.storeId;
    if (!storeId) {
      throw new Error('Store context not found');
    }
    return this.wishlistService.addItemToWishlist(
      userId,
      storeId,
      addWishlistItemDto,
    );
  }

  // Use wishlistItemId for deletion
  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(
    @Request() req: AuthenticatedRequest,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    const userId = req.user.id;
    const storeId = req.storeId;
    if (!storeId) {
      throw new Error('Store context not found');
    }
    return this.wishlistService.removeItemFromWishlist(userId, storeId, itemId);
  }
}
