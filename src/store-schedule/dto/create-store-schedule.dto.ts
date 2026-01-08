import {
  IsUUID,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsBoolean,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type DayOfWeek = (typeof daysOfWeek)[number];

export class CreateStoreScheduleDto {
  @ApiProperty({
    description: 'Nombre del horario',
    example: 'Horario de lunes a viernes',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @ApiProperty({
    description: 'Descripción del horario',
    example: 'Horario especial para días festivos',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID de la tienda',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({
    description: 'Día de la semana',
    enum: daysOfWeek,
    example: 'monday',
  })
  @IsIn(daysOfWeek, {
    message:
      'Invalid day of week. Must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday',
  })
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    description: 'Hora de apertura en formato HH:MM:SS-TZ o HH:MM-TZ',
    example: '09:00:00-05:00',
  })
  @IsNotEmpty()
  @Transform(({ value }) => {
    const timeFormatRegex =
      /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?(?:-(\d{2})(?::(\d{2}))?)?$/;

    if (!timeFormatRegex.test(value)) {
      throw new Error(
        'openTime must be in format HH:MM:SS-TZ or HH:MM-TZ (e.g., 09:00:00-05:00 or 09:00-05:00)',
      );
    }

    try {
      return value;
    } catch (error) {
      throw new Error(`Invalid time format: ${error.message}`);
    }
  })
  openTime: string;

  @ApiProperty({
    description: 'Hora de cierre en formato HH:MM:SS-TZ o HH:MM-TZ',
    example: '18:00:00-05:00',
  })
  @IsNotEmpty()
  @Transform(({ value }) => {
    const timeFormatRegex =
      /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?(?:-(\d{2})(?::(\d{2}))?)?$/;

    if (!timeFormatRegex.test(value)) {
      throw new Error(
        'closeTime must be in format HH:MM:SS-TZ or HH:MM-TZ (e.g., 18:00:00-05:00 or 18:00-05:00)',
      );
    }

    try {
      return value;
    } catch (error) {
      throw new Error(`Invalid time format: ${error.message}`);
    }
  })
  closeTime: string;

  @ApiProperty({
    description: 'Estado del horario',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
