import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const TIME_FORMAT_REGEX =
  /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?(?:-(\d{2})(?::(\d{2}))?)?$/;

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

function validateTimeFormat(value: string, fieldName: string): string {
  if (!TIME_FORMAT_REGEX.test(value)) {
    throw new Error(
      `${fieldName} must be in format HH:MM:SS-TZ or HH:MM-TZ (e.g., 09:00:00-05:00 or 09:00-05:00)`,
    );
  }
  return value;
}

export class StoreScheduleItemDto {
  @ApiProperty({
    description: 'Day of the week',
    enum: DAYS_OF_WEEK,
    example: 'monday',
  })
  @IsIn(DAYS_OF_WEEK, {
    message:
      'Invalid day of week. Must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday',
  })
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    description: 'Opening time (HH:MM:SS-TZ or HH:MM-TZ)',
    example: '09:00:00-05:00',
  })
  @IsNotEmpty()
  @Transform(({ value }) => validateTimeFormat(value, 'openTime'))
  openTime: string;

  @ApiProperty({
    description: 'Closing time (HH:MM:SS-TZ or HH:MM-TZ)',
    example: '18:00:00-05:00',
  })
  @IsNotEmpty()
  @Transform(({ value }) => validateTimeFormat(value, 'closeTime'))
  closeTime: string;

  @ApiProperty({
    description: 'Schedule name',
    example: 'Weekdays',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiProperty({
    description: 'Schedule description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
