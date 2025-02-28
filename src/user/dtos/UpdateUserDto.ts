import { Type } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { UserProfileType } from '../types/user-profile.type';

export class UpdateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsEnum(UserProfileType)
  profileType: UserProfileType;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  profileData?: any;
}
