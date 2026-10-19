import { IsString, IsDate, IsOptional } from 'class-validator';

export class ReferrerInfoDto {
  @IsString()
  id: string;

  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsDate()
  referredAt: Date;
}

export class MyReferrerResponseDto {
  @IsOptional()
  referrer: ReferrerInfoDto | null;
}
