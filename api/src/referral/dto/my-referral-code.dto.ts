import { IsString, IsDate, IsNumber } from 'class-validator';

export class MyReferralCodeDto {
  @IsString()
  code: string;

  @IsDate()
  createdAt: Date;

  @IsNumber()
  totalUsageCount: number;
}
