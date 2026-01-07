import { Expose, Type } from 'class-transformer';
import { UserSessionResponseDto } from './user-session-response.dto';

export class UserSessionPaginatedResponse {
  @Expose()
  @Type(() => UserSessionResponseDto)
  data: UserSessionResponseDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  totalPages: number;
}
