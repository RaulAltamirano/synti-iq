import { IsOptional, IsEnum, IsString, IsBoolean, IsDate } from 'class-validator';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @IsOptional()
  @IsDate()
  trialStart?: Date;

  @IsOptional()
  @IsDate()
  trialEnd?: Date;

  @IsOptional()
  @IsDate()
  currentPeriodStart?: Date;

  @IsOptional()
  @IsDate()
  currentPeriodEnd?: Date;

  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;

  @IsOptional()
  @IsString()
  planId?: string;
}
