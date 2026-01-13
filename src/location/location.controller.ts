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
import { LocationService } from './location.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { Auth, GetUser } from 'src/auth/decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('shipping')
  @Auth('', [])
  @HttpCode(HttpStatus.CREATED)
  async createShippingAddress(@GetUser() user: User, @Body() addressData: CreateAddressDto) {
    return await this.locationService.createShippingAddress(user.id, addressData);
  }

  @Post('billing')
  @Auth('', [])
  @HttpCode(HttpStatus.CREATED)
  async createBillingAddress(@GetUser() user: User, @Body() addressData: CreateAddressDto) {
    return await this.locationService.createBillingAddress(user.id, addressData);
  }

  @Get('shipping')
  @Auth('', [])
  async getShippingAddresses(@GetUser() user: User) {
    return await this.locationService.getShippingAddresses(user.id);
  }

  @Get('billing')
  @Auth('', [])
  async getBillingAddresses(@GetUser() user: User) {
    return await this.locationService.getBillingAddresses(user.id);
  }

  @Patch(':id/default-shipping')
  @Auth('', [])
  @HttpCode(HttpStatus.NO_CONTENT)
  async setDefaultShipping(@GetUser() user: User, @Param('id') addressId: string) {
    await this.locationService.setDefaultShipping(user.id, addressId);
  }

  @Patch(':id/default-billing')
  @Auth('', [])
  @HttpCode(HttpStatus.NO_CONTENT)
  async setDefaultBilling(@GetUser() user: User, @Param('id') addressId: string) {
    await this.locationService.setDefaultBilling(user.id, addressId);
  }

  @Delete(':id')
  @Auth('', [])
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(@GetUser() user: User, @Param('id') addressId: string) {
    await this.locationService.deleteAddress(user.id, addressId);
  }
}
