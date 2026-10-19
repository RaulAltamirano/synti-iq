import { IsUUID, IsNotEmpty } from 'class-validator';

export class FindSessionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  sessionId: string;
}
