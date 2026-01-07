import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateLocationDto } from 'src/location/dto/create-location.dto';

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  @IsObject()
  location?: CreateLocationDto;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  storeType?: string;

  @IsOptional()
  dailySalesTarget?: number;

  @IsOptional()
  monthlySalesTarget?: number;
}
