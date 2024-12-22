import { IsString } from 'class-validator';

export class RefreshUserDto {
  @IsString()
  id: string;
  @IsString()
  refresh: string;
}
