import { IsDate, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserSessionDto {
  @IsDate()
  @IsOptional()
  lastUsed?: Date;

  @IsBoolean()
  @IsOptional()
  isValid?: boolean;
}
