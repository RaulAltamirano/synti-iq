import { validate } from 'class-validator';
import { IsTimeHhmm } from './is-time-hhmm.validator';

class TimeDto {
  @IsTimeHhmm()
  time: string;
}

describe('IsTimeHhmm', () => {
  it('accepts valid times', async () => {
    for (const t of ['00:00', '09:30', '23:59']) {
      const dto = new TimeDto();
      dto.time = t;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    }
  });

  it('rejects invalid hour', async () => {
    const dto = new TimeDto();
    dto.time = '24:00';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects invalid minute', async () => {
    const dto = new TimeDto();
    dto.time = '12:60';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects wrong length or missing colon', async () => {
    for (const t of ['9:30', '09:5', '09-30', '']) {
      const dto = new TimeDto();
      dto.time = t;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    }
  });
});
