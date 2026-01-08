import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateDeliveryProfileDto {
  @IsString()
  vehicleType: string;

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
