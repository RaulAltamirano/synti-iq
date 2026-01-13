import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { AddressType } from './enums/address-type.enum';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createOrFindLocation(input: CreateLocationDto): Promise<Location> {
    try {
      const { coordinates, name, fullAddress, addressReference } = input;

      if (!name || !fullAddress) {
        throw new Error('Name and fullAddress are required');
      }

      if (coordinates) {
        if (
          typeof coordinates.latitude !== 'number' ||
          typeof coordinates.longitude !== 'number' ||
          isNaN(coordinates.latitude) ||
          isNaN(coordinates.longitude)
        ) {
          throw new Error('Invalid coordinates provided');
        }

        if (
          coordinates.longitude < -180 ||
          coordinates.longitude > 180 ||
          coordinates.latitude < -90 ||
          coordinates.latitude > 90
        ) {
          throw new Error('Coordinates out of valid range');
        }

        const geoPoint: Point = {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude],
        };

        const existing = await this.locationRepository.findOne({
          where: {
            coordinates: geoPoint,
          },
        });

        if (existing) {
          this.logger.log(
            `Existing location found with coordinates: [${geoPoint.coordinates.join(', ')}]`,
          );
          return existing;
        }

        const location = this.locationRepository.create({
          name,
          fullAddress,
          addressReference,
          coordinates: geoPoint,
        });

        return await this.locationRepository.save(location);
      }

      const existingByAddress = await this.locationRepository.findOne({
        where: {
          name,
          fullAddress,
        },
      });

      if (existingByAddress) {
        this.logger.log(`Existing location found with name and address.`);
        return existingByAddress;
      }

      const location = this.locationRepository.create({
        name,
        fullAddress,
        addressReference,
      });

      return await this.locationRepository.save(location);
    } catch (error) {
      this.logger.error(`Error creating/finding location: ${error.message}`, error.stack);

      if (error.message.includes('parse error') || error.message.includes('geometry')) {
        throw new Error('Invalid geographic data provided');
      }
      throw error;
    }
  }

  async createShippingAddress(userId: string, addressData: CreateAddressDto): Promise<Location> {
    await this.validateUserExists(userId);

    if (addressData.isDefaultShipping) {
      await this.clearDefaultFlags(userId, 'shipping');
    }

    return await this.createLocationForUser(userId, {
      ...addressData,
      addressType: AddressType.SHIPPING,
    });
  }

  async createBillingAddress(userId: string, addressData: CreateAddressDto): Promise<Location> {
    await this.validateUserExists(userId);

    if (addressData.isDefaultBilling) {
      await this.clearDefaultFlags(userId, 'billing');
    }

    return await this.createLocationForUser(userId, {
      ...addressData,
      addressType: AddressType.BILLING,
    });
  }

  private async validateUserExists(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  private async clearDefaultFlags(userId: string, type: 'shipping' | 'billing'): Promise<void> {
    const field = type === 'shipping' ? 'isDefaultShipping' : 'isDefaultBilling';
    await this.locationRepository.update(
      { user: { id: userId }, [field]: true },
      { [field]: false },
    );
  }

  private async createLocationForUser(
    userId: string,
    addressData: CreateAddressDto,
  ): Promise<Location> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let coordinates: Point | null = null;
    if (addressData.coordinates) {
      if (
        typeof addressData.coordinates.latitude !== 'number' ||
        typeof addressData.coordinates.longitude !== 'number' ||
        isNaN(addressData.coordinates.latitude) ||
        isNaN(addressData.coordinates.longitude)
      ) {
        throw new BadRequestException('Invalid coordinates provided');
      }

      if (
        addressData.coordinates.longitude < -180 ||
        addressData.coordinates.longitude > 180 ||
        addressData.coordinates.latitude < -90 ||
        addressData.coordinates.latitude > 90
      ) {
        throw new BadRequestException('Coordinates out of valid range');
      }

      coordinates = {
        type: 'Point',
        coordinates: [addressData.coordinates.longitude, addressData.coordinates.latitude],
      };
    }

    const location = this.locationRepository.create({
      name: addressData.name,
      fullAddress: addressData.fullAddress,
      addressReference: addressData.addressReference,
      coordinates,
      user,
      addressType: addressData.addressType,
      isDefaultShipping: addressData.isDefaultShipping || false,
      isDefaultBilling: addressData.isDefaultBilling || false,
    });

    return await this.locationRepository.save(location);
  }

  async getShippingAddresses(userId: string): Promise<Location[]> {
    return await this.locationRepository.find({
      where: {
        user: { id: userId },
        addressType: AddressType.SHIPPING,
      },
      order: { isDefaultShipping: 'DESC', createdAt: 'DESC' },
    });
  }

  async getBillingAddresses(userId: string): Promise<Location[]> {
    return await this.locationRepository.find({
      where: {
        user: { id: userId },
        addressType: AddressType.BILLING,
      },
      order: { isDefaultBilling: 'DESC', createdAt: 'DESC' },
    });
  }

  async getDefaultShippingAddress(userId: string): Promise<Location | null> {
    return await this.locationRepository.findOne({
      where: {
        user: { id: userId },
        isDefaultShipping: true,
        addressType: AddressType.SHIPPING,
      },
    });
  }

  async getDefaultBillingAddress(userId: string): Promise<Location | null> {
    return await this.locationRepository.findOne({
      where: {
        user: { id: userId },
        isDefaultBilling: true,
        addressType: AddressType.BILLING,
      },
    });
  }

  async setDefaultShipping(userId: string, addressId: string): Promise<void> {
    await this.setDefaultAddress(userId, addressId, 'shipping');
  }

  async setDefaultBilling(userId: string, addressId: string): Promise<void> {
    await this.setDefaultAddress(userId, addressId, 'billing');
  }

  private async setDefaultAddress(
    userId: string,
    addressId: string,
    type: 'shipping' | 'billing',
  ): Promise<void> {
    const address = await this.locationRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found for user ${userId}`);
    }

    await this.clearDefaultFlags(userId, type);

    const isShipping = type === 'shipping';
    if (isShipping) {
      address.isDefaultShipping = true;
    } else {
      address.isDefaultBilling = true;
    }

    if (address.addressType === null) {
      address.addressType = isShipping ? AddressType.SHIPPING : AddressType.BILLING;
    } else if (
      (isShipping && address.addressType === AddressType.BILLING) ||
      (!isShipping && address.addressType === AddressType.SHIPPING)
    ) {
      address.addressType = AddressType.BOTH;
    }

    await this.locationRepository.save(address);
  }

  async validateAddressForShipping(userId: string): Promise<boolean> {
    const count = await this.locationRepository.count({
      where: {
        user: { id: userId },
        addressType: AddressType.SHIPPING,
      },
    });
    return count > 0;
  }

  async validateAddressForBilling(userId: string): Promise<boolean> {
    const count = await this.locationRepository.count({
      where: {
        user: { id: userId },
        addressType: AddressType.BILLING,
      },
    });
    return count > 0;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.locationRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found for user ${userId}`);
    }

    await this.locationRepository.delete({ id: addressId });
  }
}
