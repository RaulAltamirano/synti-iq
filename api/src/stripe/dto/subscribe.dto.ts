
import { IsString } from 'class-validator';

export class SubscribeDto {
  @IsString()
  customerId: string;

  @IsString()
  priceId: string;

  @IsString()
  locationId: string;
}
