import { IsDate, IsIn, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TemplateItemResponseDto {
  @ApiProperty({ description: 'Template item UUID', format: 'uuid' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Item name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Item status', enum: ['active', 'inactive'] })
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';

  @ApiProperty({ description: 'Creation timestamp', format: 'date-time' })
  @IsDate()
  createdAt: Date;
}
