import { InputType, Field, PartialType } from '@nestjs/graphql';
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

@InputType()
export class UpdateStoreScheduleDto extends PartialType(CreateStoreScheduleDto) {
  @ApiProperty({
    description: 'Nombre del horario',
    example: 'Horario de lunes a viernes',
    minLength: 3,
    required: false,
  })
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Descripción del horario',
    example: 'Horario especial para días festivos',
    required: false,
  })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Día de la semana',
    enum: daysOfWeek,
    example: 'monday',
    required: false,
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsIn(daysOfWeek, { message: 'Invalid day of week' })
  dayOfWeek?: DayOfWeek;

  @ApiProperty({
    description: 'Hora de apertura en formato HH:MM:SS-TZ o HH:MM-TZ',
    example: '09:00:00-05:00',
    required: false,
  })
  @Field(() => String, { nullable: true })
  @IsOptional()
  openTime?: string;

  @ApiProperty({
    description: 'Hora de cierre en formato HH:MM:SS-TZ o HH:MM-TZ',
    example: '18:00:00-05:00',
    required: false,
  })
  @Field(() => String, { nullable: true })
  @IsOptional()
  closeTime?: string;

  @ApiProperty({
    description: 'Estado del horario',
    example: true,
    required: false,
  })
  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}
