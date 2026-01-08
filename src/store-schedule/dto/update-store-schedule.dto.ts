import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsIn, IsString } from 'class-validator';
import { CreateStoreScheduleDto } from './create-store-schedule.dto';
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

export class UpdateStoreScheduleDto extends PartialType(CreateStoreScheduleDto) {
  @ApiProperty({
    description: 'Nombre del horario',
    example: 'Horario de lunes a viernes',
    minLength: 3,
    required: false,
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Descripción del horario',
    example: 'Horario especial para días festivos',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Día de la semana',
    enum: daysOfWeek,
    example: 'monday',
    required: false,
  })
  @IsOptional()
  @IsIn(daysOfWeek, { message: 'Invalid day of week' })
  dayOfWeek?: DayOfWeek;

  @ApiProperty({
    description: 'Hora de apertura en formato HH:MM:SS-TZ o HH:MM-TZ',
    example: '09:00:00-05:00',
    required: false,
  })
  @IsOptional()
  openTime?: string;

  @ApiProperty({
    description: 'Hora de cierre en formato HH:MM:SS-TZ o HH:MM-TZ',
    example: '18:00:00-05:00',
    required: false,
  })
  @IsOptional()
  closeTime?: string;

  @ApiProperty({
    description: 'Estado del horario',
    example: true,
    required: false,
  })
  @IsOptional()
  isActive?: boolean;
}
