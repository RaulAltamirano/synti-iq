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
}
