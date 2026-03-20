import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddressType } from '../enums/address-type.enum';
import { CoordinatesDto } from './create-location.dto';

export class CreateAddressDto {
  @ApiProperty({
    description: 'Location or address nickname',
    example: 'Home',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la ubicación es obligatorio' })
  @Length(2, 100, {
    message: 'El nombre debe tener entre 2 y 100 caracteres',
  })
  name: string;

  @ApiProperty({
    description: 'Full street address',
    example: '123 Main St, City, Country',
    minLength: 5,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @Length(5, 255, {
    message: 'La dirección debe tener entre 5 y 255 caracteres',
  })
  fullAddress: string;

  @ApiProperty({
    description: 'Additional reference (building, floor, etc.)',
    example: 'Apt 4B',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  addressReference?: string;

  @ApiProperty({ description: 'Street name', required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  street?: string;

  @ApiProperty({ description: 'Neighborhood or district', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  neighborhood?: string;

  @ApiProperty({ description: 'City', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  city?: string;

  @ApiProperty({ description: 'State or province', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  state?: string;

  @ApiProperty({ description: 'Postal or ZIP code', required: false, maxLength: 20 })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  postalCode?: string;

  @ApiProperty({ description: 'Country', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  country?: string;

  @ApiProperty({
    description: 'Address type',
    enum: AddressType,
    example: AddressType.SHIPPING,
  })
  @IsEnum(AddressType)
  addressType: AddressType;

  @ApiProperty({
    description: 'Set as default shipping address',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefaultShipping?: boolean;

  @ApiProperty({
    description: 'Set as default billing address',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefaultBilling?: boolean;

  @ApiProperty({
    description: 'Geographic coordinates',
    required: false,
    type: () => CoordinatesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}
