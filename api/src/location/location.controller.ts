import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { Auth, GetUser } from 'src/auth/decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('Location')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('shipping')
  @Auth('', [])
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Create a new shipping address' })
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({ status: 201, description: 'Shipping address created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid address data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createShippingAddress(@GetUser() user: User, @Body() addressData: CreateAddressDto) {
    return await this.locationService.createShippingAddress(user.id, addressData);
  }

  @Post('billing')
  @Auth('', [])
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Create a new billing address' })
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({ status: 201, description: 'Billing address created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid address data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBillingAddress(@GetUser() user: User, @Body() addressData: CreateAddressDto) {
    return await this.locationService.createBillingAddress(user.id, addressData);
  }

  @Get('shipping')
  @Auth('', [])
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get all shipping addresses for the current user' })
  @ApiResponse({ status: 200, description: 'List of shipping addresses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getShippingAddresses(@GetUser() user: User) {
    return await this.locationService.getShippingAddresses(user.id);
  }

  @Get('billing')
  @Auth('', [])
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get all billing addresses for the current user' })
  @ApiResponse({ status: 200, description: 'List of billing addresses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBillingAddresses(@GetUser() user: User) {
    return await this.locationService.getBillingAddresses(user.id);
  }

  @Patch(':id/default-shipping')
  @Auth('', [])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Set an address as default shipping' })
  @ApiParam({ name: 'id', description: 'Address ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Default shipping address updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async setDefaultShipping(@GetUser() user: User, @Param('id') addressId: string) {
    await this.locationService.setDefaultShipping(user.id, addressId);
  }

  @Patch(':id/default-billing')
  @Auth('', [])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Set an address as default billing' })
  @ApiParam({ name: 'id', description: 'Address ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Default billing address updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async setDefaultBilling(@GetUser() user: User, @Param('id') addressId: string) {
    await this.locationService.setDefaultBilling(user.id, addressId);
  }

  @Delete(':id')
  @Auth('', [])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiParam({ name: 'id', description: 'Address ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Address deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async deleteAddress(@GetUser() user: User, @Param('id') addressId: string) {
    await this.locationService.deleteAddress(user.id, addressId);
  }
}
