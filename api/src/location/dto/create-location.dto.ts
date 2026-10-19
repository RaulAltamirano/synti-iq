import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CoordinatesDto {
  @ApiProperty({ description: 'Latitude', example: -33.44889 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: -70.669265 })
  @IsNumber()
  longitude: number;
}

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty({ message: 'Location name is required' })
  @Length(2, 100, {
    message: 'Name must be between 2 and 100 characters',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @Length(5, 255, {
    message: 'Address must be between 5 and 255 characters',
  })
  fullAddress: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  addressReference?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  street?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  country?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}
