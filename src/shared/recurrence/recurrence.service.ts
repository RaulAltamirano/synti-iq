import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DateUtils } from '../utils/date-utils';
import { RecurrenceRuleDto } from 'src/recurring-schedule-template/entities/recurring-rules.dto';
import { addDays, addWeeks, addMonths, addYears, isSameDay } from 'date-fns';

@Injectable()
export class RecurrenceService {
  private readonly logger = new Logger(RecurrenceService.name);

  getOccurrenceDates(pattern: string, startDate: Date, endDate: Date): Date[] {
    try {
      const rules = this.parseRecurrencePattern(pattern);
      const occurrences: Date[] = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        if (this.matchesRecurrenceRules(currentDate, rules)) {
          occurrences.push(new Date(currentDate));
        }
        currentDate = this.getNextDate(currentDate, rules);
      }

      return occurrences;
    } catch (error) {
      this.logger.error(`Error generating occurrence dates: ${error.message}`, error.stack);
      throw new Error(`Failed to generate occurrence dates: ${error.message}`);
    }
  }

  private parseRecurrencePattern(pattern: string): any {
    const rules: any = {};
    const parts = pattern.split(';');

    for (const part of parts) {
      const [key, value] = part.split('=');
      rules[key] = value;
    }

    return rules;
  }

  private matchesRecurrenceRules(date: Date, rules: any): boolean {
    if (rules.FREQ === 'WEEKLY' && rules.BYDAY) {
      const days = rules.BYDAY.split(',');
      const dayMap: { [key: string]: number } = {
        SU: 0,
        MO: 1,
        TU: 2,
        WE: 3,
        TH: 4,
        FR: 5,
        SA: 6,
      };
      return days.some((day: string) => date.getDay() === dayMap[day]);
    }

    if (rules.FREQ === 'MONTHLY' && rules.BYMONTHDAY) {
      const days = rules.BYMONTHDAY.split(',').map(Number);
      return days.includes(date.getDate());
    }

    if (rules.FREQ === 'YEARLY' && rules.BYMONTH && rules.BYMONTHDAY) {
      const months = rules.BYMONTH.split(',').map(Number);
      const days = rules.BYMONTHDAY.split(',').map(Number);
      return months.includes(date.getMonth() + 1) && days.includes(date.getDate());
    }

    return true;
  }

  private getNextDate(date: Date, rules: any): Date {
    let nextDate = new Date(date);

    switch (rules.FREQ) {
      case 'DAILY':
        nextDate = addDays(date, 1);
        break;
      case 'WEEKLY':
        nextDate = addWeeks(date, 1);
        break;
      case 'MONTHLY':
        nextDate = addMonths(date, 1);
        break;
      case 'YEARLY':
        nextDate = addYears(date, 1);
        break;
      default:
        nextDate = addDays(date, 1);
    }

    return nextDate;
  }

  getOccurrenceDatesForRules(rules: RecurrenceRuleDto[], startDate: Date, endDate: Date): Date[] {
    if (!rules?.length) return [];

    if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
      throw new BadRequestException('Fechas de inicio o fin inválidas');
    }

    try {
      const allDates = rules.flatMap(rule =>
        DateUtils.getOccurrenceDates(rule, startDate, endDate),
      );

      const invalidDateIndex = allDates.findIndex(date => !this.isValidDate(date));
      if (invalidDateIndex >= 0) {
        throw new Error(`Fecha inválida generada en la posición ${invalidDateIndex}`);
      }

      return [...new Map(allDates.map(date => [date.getTime(), date])).values()];
    } catch (error) {
      this.logger.error('Error al generar fechas de ocurrencia', error);
      throw new InternalServerErrorException('Error al procesar reglas de recurrencia');
    }
  }
  isValidDate(endDate: Date) {
    return true;
  }

  getNextOccurrence(rules: RecurrenceRuleDto[], afterDate: Date): Date | null {
    const endDate = new Date(afterDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const dates = this.getOccurrenceDatesForRules(rules, afterDate, endDate);

    const futureDates = dates.filter(date => date > afterDate);

    futureDates.sort((a, b) => a.getTime() - b.getTime());
    return futureDates.length > 0 ? futureDates[0] : null;
  }
}
