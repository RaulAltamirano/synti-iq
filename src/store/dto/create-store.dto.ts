import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateLocationDto } from 'src/location/dto/create-location.dto';
import { StoreScheduleItemDto } from './store-schedule-item.dto';

@ValidatorConstraint({ name: 'UniqueScheduleDays', async: false })
export class UniqueScheduleDaysValidator implements ValidatorConstraintInterface {
  validate(schedules: StoreScheduleItemDto[] | undefined, args: ValidationArguments) {
    if (!schedules || schedules.length === 0) return true;
    const days = schedules.map(s => s.dayOfWeek);
    const unique = new Set(days);
    return unique.size === days.length;
  }

  defaultMessage() {
    return 'schedules must not contain duplicate dayOfWeek (at most one entry per day)';
  }
}

@ValidatorConstraint({ name: 'ScheduleTimesOrder', async: false })
export class ScheduleTimesOrderValidator implements ValidatorConstraintInterface {
  validate(schedules: StoreScheduleItemDto[] | undefined) {
    if (!schedules || schedules.length === 0) return true;
    for (const s of schedules) {
      const open = parseTimeString(s.openTime);
      const close = parseTimeString(s.closeTime);
      if (open >= close) return false;
    }
    return true;
  }

  defaultMessage() {
    return 'openTime must be before closeTime for each schedule';
  }
}

function parseTimeString(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  return hours * 3600 + minutes * 60 + seconds;
}

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  @IsObject()
  location?: CreateLocationDto;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  storeType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailySalesTarget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlySalesTarget?: number;

  @ApiProperty({
    description:
      'Optional opening schedules (one entry per day). Days not included are closed. Format: dayOfWeek (monday..sunday), openTime, closeTime (HH:MM or HH:MM:SS, optional -HH or -HH:MM timezone).',
    type: [StoreScheduleItemDto],
    required: false,
    example: [
      { dayOfWeek: 'monday', openTime: '08:00-05:00', closeTime: '21:00-05:00' },
      { dayOfWeek: 'tuesday', openTime: '08:00-05:00', closeTime: '21:00-05:00' },
      { dayOfWeek: 'wednesday', openTime: '08:00-05:00', closeTime: '21:00-05:00' },
      { dayOfWeek: 'thursday', openTime: '08:00-05:00', closeTime: '21:00-05:00' },
      { dayOfWeek: 'friday', openTime: '08:00-05:00', closeTime: '21:00-05:00' },
      { dayOfWeek: 'saturday', openTime: '08:00-05:00', closeTime: '14:00-05:00' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreScheduleItemDto)
  @Validate(UniqueScheduleDaysValidator)
  @Validate(ScheduleTimesOrderValidator)
  schedules?: StoreScheduleItemDto[];
}
