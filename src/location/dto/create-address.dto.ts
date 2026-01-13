import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsObject,
  ValidateNested,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressType } from '../enums/address-type.enum';
import { CoordinatesDto } from './create-location.dto';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la ubicación es obligatorio' })
  @Length(2, 100, {
    message: 'El nombre debe tener entre 2 y 100 caracteres',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @Length(5, 255, {
    message: 'La dirección debe tener entre 5 y 255 caracteres',
  })
  fullAddress: string;

  @IsOptional()
  @IsString()
  addressReference?: string;

  @IsEnum(AddressType)
  addressType: AddressType;

  @IsOptional()
  @IsBoolean()
  isDefaultShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefaultBilling?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}
