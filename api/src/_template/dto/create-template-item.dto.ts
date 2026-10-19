import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateItemDto {
  @ApiProperty({ description: 'Item name', example: 'My Template Item' })
  @IsString()
  @MinLength(1)
  name: string;

  /** Optional. Default 'active' applied in service when omitted (class-validator does not apply TS defaults). */
  @ApiPropertyOptional({
    description: 'Item status',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive' = 'active';
}
