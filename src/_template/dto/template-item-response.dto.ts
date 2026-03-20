import { IsDate, IsIn, IsString, IsUUID } from 'class-validator';

export class TemplateItemResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';

  @IsDate()
  createdAt: Date;
}
