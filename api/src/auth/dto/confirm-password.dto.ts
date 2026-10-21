import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { VerifyTotpDto } from './verify-totp.dto';

export class ConfirmPasswordDto {
  @ApiProperty({ description: 'Current account password' })
  @IsString()
  @MinLength(1)
  password: string;
}

export class VerifyTotpWithPasswordDto extends IntersectionType(
  VerifyTotpDto,
  ConfirmPasswordDto,
) {}
