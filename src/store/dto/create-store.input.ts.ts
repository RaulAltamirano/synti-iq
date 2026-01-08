import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateStoreInput {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailySalesTarget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlySalesTarget?: number;

  @IsOptional()
  @IsString()
  storeType?: string;
}
