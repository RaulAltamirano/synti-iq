import { RRule, Frequency } from 'rrule';
import { isSameDay } from 'date-fns';
import { RecurrenceRuleDto } from 'src/recurring-schedule-template/entities/recurring-rules.dto';
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
