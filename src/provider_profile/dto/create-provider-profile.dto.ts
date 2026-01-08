import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateProviderProfileDto {
  @IsString()
  companyName: string;

  @IsString()
  taxId: string;

  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
