import { IsString, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';

import { VehicleType } from 'src/delivery-profiles/enums/vehicle-type.enum';

export class CreateDeliveryProfileDto {
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsString()
  licensePlate: string;

  @IsString()
  zone: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredZones?: string[];
}
