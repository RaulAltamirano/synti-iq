import { Expose, Type } from 'class-transformer';
import { DeviceInfoDto } from './device-info.dto';

export class UserSessionResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  sessionId: string;

  @Expose()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;

  @Expose()
  userAgent?: string;

  @Expose()
  ipAddress?: string;

  @Expose()
  lastUsed: Date;

  @Expose()
  isValid: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
