import { RRule, Frequency } from 'rrule';
import { isSameDay } from 'date-fns';
import type { RecurrenceRuleDto } from 'src/recurring-schedule-template/entities/recurring-rules.dto';
export class DateUtils {
  static addMinutesToDate(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  static isCrossingDayBoundary(startTime: Date, endTime: Date): boolean {
    return endTime < startTime;
  }

  static timeStringToDate(timeString: string, baseDate: Date): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  static normalizeTimeStringForPg(timeStr: string): string {
    const match = timeStr.match(
      /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?((?:[+-]\d{2}(?::\d{2})?)?)$/,
    );
    if (!match) {
      throw new Error(
        `Invalid time format: ${timeStr}. Use HH:MM or HH:MM:SS with optional ±HH or ±HH:MM timezone.`,
      );
    }
    const hours = match[1].padStart(2, '0');
    const minutes = match[2];
    const seconds = match[3] ?? '00';
    const tzPart = match[4] || '';
    return `${hours}:${minutes}:${seconds}${tzPart}`;
  }

  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  static createRRule(rule: RecurrenceRuleDto, dtstart: Date): RRule {
    const options: any = {
      dtstart,
      until: rule.until,
      count: rule.count,
      interval: rule.interval || 1,
    };

    switch (rule.frequency) {
      case 'daily':
        options.freq = Frequency.DAILY;
        break;
      case 'weekly':
        options.freq = Frequency.WEEKLY;
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          options.byweekday = rule.daysOfWeek;
        }
        break;
      case 'monthly':
        options.freq = Frequency.MONTHLY;
        if (rule.dayOfMonth) {
          options.bymonthday = rule.dayOfMonth;
        }
        break;
      case 'yearly':
        options.freq = Frequency.YEARLY;
        break;
    }

    return new RRule(options);
  }

  static getOccurrenceDates(rule: RecurrenceRuleDto, startDate: Date, endDate: Date): Date[] {
    const rrule = this.createRRule(rule, new Date(startDate));
    const dates = rrule.between(new Date(startDate), new Date(endDate), true);

    if (rule.exceptions && rule.exceptions.length > 0) {
      return dates.filter(
        date => !rule.exceptions!.some(exception => isSameDay(date, new Date(exception))),
      );
    }

    return dates;
  }
}
