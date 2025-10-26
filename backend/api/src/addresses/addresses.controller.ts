import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Put, // Use Put for setting default
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';

// Define the shape of the request object after JWT validation
interface AuthenticatedRequest extends Request {
  user: Omit<UserEntity, 'passwordHash'>; // User payload attached by JwtStrategy.validate
}

@UseGuards(JwtAuthGuard) // Apply guard to all routes in this controller
@Controller('account/addresses') // Route prefix: /api/account/addresses
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const userId = req.user.id;
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.addressesService.findAllForUser(userId);
  }

  // Get one specific address - useful for pre-populating edit form? Maybe not needed for account page.
  // @Get(':id')
  // findOne(@Request() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
  //   const userId = req.user.id;
  //   return this.addressesService.findOneByIdAndUser(id, userId);
  // }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const userId = req.user.id;
    return this.addressesService.update(id, userId, updateAddressDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = req.user.id;
    return this.addressesService.remove(id, userId);
  }

  // Endpoint to set default shipping address
  @Put(':id/default/shipping')
  @HttpCode(HttpStatus.NO_CONTENT)
  setDefaultShipping(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = req.user.id;
    return this.addressesService.setDefault(id, userId, 'shipping');
  }

  // Endpoint to set default billing address
  @Put(':id/default/billing')
  @HttpCode(HttpStatus.NO_CONTENT)
  setDefaultBilling(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = req.user.id;
    return this.addressesService.setDefault(id, userId, 'billing');
  }
}
