import { IsOptional, IsNumber, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  trialDays?: number;
}
