import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { parseISO, isValid } from 'date-fns';

@Injectable()
export class DateTimeService {
  convertTimeToMinutes(time: string): number {
    try {
      const [hours, minutes] = time.split(':').map(Number);

      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        throw new BadRequestException(`Formato de hora inválido: ${time}. Use el formato "HH:MM"`);
      }

      return hours * 60 + minutes;
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException(`Error al procesar hora: ${time}. Use el formato "HH:MM"`);
    }
  }

  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  validateAndParseDate(date: Date | string): Date {
    if (!date) return null;

    const parsedDate = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(parsedDate)) {
      throw new BadRequestException(`Fecha inválida: ${date}`);
    }

    return parsedDate;
  }
}
