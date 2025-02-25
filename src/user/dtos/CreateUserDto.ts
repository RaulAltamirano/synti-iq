import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsObject,
  ValidateNested,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { UserProfileType } from '../types/user-profile.type';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(UserProfileType)
  profileType: UserProfileType;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  profileData?: any;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
