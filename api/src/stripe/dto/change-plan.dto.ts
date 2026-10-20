import { IsString } from 'class-validator';

export class ChangePlanDto {
  @IsString()
  subscriptionId: string;

  @IsString()
  newPriceId: string;
}