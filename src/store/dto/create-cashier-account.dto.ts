import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

/**
 * Body for {@link StoreController.createCashierAccount}: creates a User with role CASHIER
 * and a {@link CashierProfile} scoped to the store in the URL (storeId is not accepted from the client).
 */
export class CreateCashierAccountDto {
  @ApiProperty({ example: 'cashier@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ description: 'Branch or office label for this cashier' })
  @IsString()
  @MinLength(1)
  branchOffice: string;

  @ApiProperty({ description: 'Cashier number or identifier within the store' })
  @IsString()
  @MinLength(1)
  cashierNumber: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  shiftStartTime?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  shiftEndTime?: Date;
}
