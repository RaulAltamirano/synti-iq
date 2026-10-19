import { DateUtils } from './date-utils';

describe('DateUtils.normalizeTimeStringForPg', () => {
  it('should normalize HH:MM to HH:MM:00', () => {
    expect(DateUtils.normalizeTimeStringForPg('09:00')).toBe('09:00:00');
  });

  it('should keep HH:MM:SS as-is (with seconds)', () => {
    expect(DateUtils.normalizeTimeStringForPg('14:30:45')).toBe('14:30:45');
  });

  it('should normalize HH:MM with timezone to HH:MM:00-TZ', () => {
    expect(DateUtils.normalizeTimeStringForPg('08:00-06:00')).toBe('08:00:00-06:00');
    expect(DateUtils.normalizeTimeStringForPg('09:00-05:00')).toBe('09:00:00-05:00');
  });

  it('should keep HH:MM:SS with timezone as-is', () => {
    expect(DateUtils.normalizeTimeStringForPg('18:00:00-05:00')).toBe('18:00:00-05:00');
  });

  it('should throw on invalid format', () => {
    expect(() => DateUtils.normalizeTimeStringForPg('25:00')).toThrow();
    expect(() => DateUtils.normalizeTimeStringForPg('invalid')).toThrow();
  });
});
