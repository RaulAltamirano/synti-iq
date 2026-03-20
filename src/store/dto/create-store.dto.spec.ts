import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CreateStoreDto,
  UniqueScheduleDaysValidator,
  ScheduleTimesOrderValidator,
} from './create-store.dto';
import { StoreScheduleItemDto } from './store-schedule-item.dto';

describe('CreateStoreDto', () => {
  describe('schedules validation', () => {
    it('should pass when schedules have unique dayOfWeek', async () => {
      const dto = plainToInstance(CreateStoreDto, {
        name: 'Test Store',
        schedules: [
          { dayOfWeek: 'monday', openTime: '09:00-05:00', closeTime: '18:00-05:00' },
          { dayOfWeek: 'tuesday', openTime: '09:00-05:00', closeTime: '18:00-05:00' },
        ],
      });
      const errors = await validate(dto, { whitelist: true });
      const scheduleErrors = errors.filter(e => e.property === 'schedules');
      expect(scheduleErrors.length).toBe(0);
    });

    it('should fail when schedules contain duplicate dayOfWeek', async () => {
      const dto = plainToInstance(CreateStoreDto, {
        name: 'Test Store',
        schedules: [
          { dayOfWeek: 'monday', openTime: '09:00-05:00', closeTime: '18:00-05:00' },
          { dayOfWeek: 'monday', openTime: '10:00-05:00', closeTime: '17:00-05:00' },
        ],
      });
      const errors = await validate(dto, { whitelist: true });
      const scheduleErrors = errors.filter(e => e.property === 'schedules');
      expect(scheduleErrors.length).toBeGreaterThan(0);
      expect(scheduleErrors[0].constraints).toHaveProperty('UniqueScheduleDays');
    });

    it('should fail when openTime is not before closeTime', async () => {
      const dto = plainToInstance(CreateStoreDto, {
        name: 'Test Store',
        schedules: [{ dayOfWeek: 'monday', openTime: '18:00-05:00', closeTime: '09:00-05:00' }],
      });
      const errors = await validate(dto, { whitelist: true });
      const scheduleErrors = errors.filter(e => e.property === 'schedules');
      expect(scheduleErrors.length).toBeGreaterThan(0);
      expect(scheduleErrors[0].constraints).toHaveProperty('ScheduleTimesOrder');
    });

    it('should pass when no schedules provided', async () => {
      const dto = plainToInstance(CreateStoreDto, {
        name: 'Test Store',
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors.filter(e => e.property === 'schedules').length).toBe(0);
    });
  });
});

describe('UniqueScheduleDaysValidator', () => {
  const validator = new UniqueScheduleDaysValidator();

  it('should return true for empty or undefined schedules', () => {
    expect(validator.validate(undefined, {} as any)).toBe(true);
    expect(validator.validate([], {} as any)).toBe(true);
  });

  it('should return true when all days are unique', () => {
    const schedules: StoreScheduleItemDto[] = [
      { dayOfWeek: 'monday', openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 'tuesday', openTime: '09:00', closeTime: '18:00' },
    ];
    expect(validator.validate(schedules, {} as any)).toBe(true);
  });

  it('should return false when days are duplicated', () => {
    const schedules: StoreScheduleItemDto[] = [
      { dayOfWeek: 'monday', openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 'monday', openTime: '10:00', closeTime: '17:00' },
    ];
    expect(validator.validate(schedules, {} as any)).toBe(false);
  });
});

describe('ScheduleTimesOrderValidator', () => {
  const validator = new ScheduleTimesOrderValidator();

  it('should return true for empty or undefined schedules', () => {
    expect(validator.validate(undefined)).toBe(true);
    expect(validator.validate([])).toBe(true);
  });

  it('should return true when openTime is before closeTime', () => {
    const schedules: StoreScheduleItemDto[] = [
      { dayOfWeek: 'monday', openTime: '09:00', closeTime: '18:00' },
    ];
    expect(validator.validate(schedules)).toBe(true);
  });

  it('should return false when openTime is after closeTime', () => {
    const schedules: StoreScheduleItemDto[] = [
      { dayOfWeek: 'monday', openTime: '18:00', closeTime: '09:00' },
    ];
    expect(validator.validate(schedules)).toBe(false);
  });
});
