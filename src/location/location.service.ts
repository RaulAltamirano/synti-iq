import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
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
}
