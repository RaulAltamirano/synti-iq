import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUnassignedCashierAccountDto {
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

  @ApiPropertyOptional({ description: 'Branch or office label for this cashier' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  branchOffice?: string;

  @ApiPropertyOptional({ description: 'Cashier number or identifier within the store' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  cashierNumber?: string;

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
